"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Icon } from "@/components/ui";
import { getProductPhotoSrc } from "@/lib/productMedia";
import type { Product } from "@/types/productTypes";

import styles from "./PurchaseRequestModal.module.css";

export type PurchaseRequestItem = {
  product: Product;
  quantity: number;
};

type PurchaseRequestModalProps = {
  open: boolean;
  items: PurchaseRequestItem[];
  productTotal: number;
  shippingFee: number;
  orderTotal: number;
  onClose: () => void;
  onSubmit: (payload: { requester: string; message: string }) => void;
};

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function categoryLabel(product: Product) {
  const category = product.category?.name;
  const sub = product.subCategory?.name;
  if (category && sub) return `${category} ・ ${sub}`;
  return sub ?? category ?? "";
}

/** 인증 전 임시 표시명. 로그인 연동 시 교체 */
const DEFAULT_REQUESTER = "김스낵";

export function PurchaseRequestModal({
  open,
  items,
  productTotal,
  shippingFee,
  orderTotal,
  onClose,
  onSubmit,
}: PurchaseRequestModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [requester, setRequester] = useState(DEFAULT_REQUESTER);
  const [message, setMessage] = useState("");

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!open) return;
    setRequester(DEFAULT_REQUESTER);
    setMessage("");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedRequester = requester.trim();
    if (!trimmedRequester || items.length === 0) return;
    onSubmit({
      requester: trimmedRequester,
      message: message.trim(),
    });
  };

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            구매 요청
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="닫기"
            onClick={onClose}
          >
            <Icon name="close" size="sm" />
          </button>
        </header>

        <hr className={styles.divider} />

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="purchase-requester">
              요청인
            </label>
            <input
              id="purchase-requester"
              className={styles.input}
              value={requester}
              onChange={(event) => setRequester(event.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className={styles.field}>
            <p className={styles.label}>요청 품목</p>
            <div className={styles.itemPanel}>
              <ul className={styles.itemList}>
                {items.map(({ product, quantity }, index) => {
                  const photoSrc = getProductPhotoSrc(product.photo);
                  const lineTotal = product.price * quantity;
                  const label = categoryLabel(product);

                  return (
                    <li key={product.id} className={styles.item}>
                      <div className={styles.itemTop}>
                        <div className={styles.itemInfo}>
                          <span className={styles.thumb}>
                            {photoSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={photoSrc}
                                alt=""
                                className={styles.thumbImage}
                                onError={(event) =>
                                  event.currentTarget.remove()
                                }
                              />
                            ) : null}
                          </span>
                          <span className={styles.itemCopy}>
                            {label ? (
                              <span className={styles.itemCategory}>
                                {label}
                              </span>
                            ) : null}
                            <span className={styles.itemName}>
                              {product.name}
                            </span>
                          </span>
                        </div>
                        <strong className={styles.unitPrice}>
                          {formatPrice(product.price)}
                        </strong>
                      </div>
                      <div className={styles.itemBottom}>
                        <span>수량: {quantity}개</span>
                        <strong>{formatPrice(lineTotal)}</strong>
                      </div>
                      {index < items.length - 1 ? (
                        <hr className={styles.itemDivider} />
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              <div className={styles.itemSummary}>
                <span>
                  총 {totalQuantity}
                  <span className={styles.itemSummaryUnit}>건</span>
                </span>
                <strong>{formatPrice(orderTotal)}</strong>
              </div>
              <p className={styles.feeHint}>
                상품금액 {formatPrice(productTotal)} · 배송비{" "}
                {formatPrice(shippingFee)}
              </p>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="purchase-message">
              요청 메시지
            </label>
            <textarea
              id="purchase-message"
              className={styles.textarea}
              placeholder="요청 메시지를 입력해주세요."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!requester.trim() || items.length === 0}
            >
              구매 요청하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
