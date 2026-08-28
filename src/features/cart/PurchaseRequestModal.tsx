"use client";

import {
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { Icon, ModalShell } from "@/components/ui";
import type { CartItemWithProduct } from "@/types/cartTypes";

const MAX_REQUEST_MESSAGE_LENGTH = 500;

export type PurchaseRequestModalProps = {
  open: boolean;
  items: CartItemWithProduct[];
  productTotal: number;
  shippingFee: number;
  orderTotal: number;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: { message: string }) => void;
};

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

/**
 * 장바구니 → 구매 요청 확인 모달.
 * 요청 메시지 입력 후 제출하면 완료 화면으로 이어집니다.
 */
export function PurchaseRequestModal({
  open,
  items,
  productTotal,
  shippingFee,
  orderTotal,
  submitting = false,
  onClose,
  onSubmit,
}: PurchaseRequestModalProps) {
  const titleId = useId();
  const [message, setMessage] = useState("");
  const [isMessageLimitExceeded, setIsMessageLimitExceeded] = useState(false);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!open) return;
    setMessage("");
    setIsMessageLimitExceeded(false);
  }, [open]);

  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextMessage = event.target.value;

    if (nextMessage.length > MAX_REQUEST_MESSAGE_LENGTH) {
      setMessage(nextMessage.slice(0, MAX_REQUEST_MESSAGE_LENGTH));
      setIsMessageLimitExceeded(true);
      return;
    }

    setMessage(nextMessage);
    setIsMessageLimitExceeded(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (items.length === 0 || submitting) return;
    onSubmit({ message: message.trim() });
  };

  return (
    <ModalShell
      open={open}
      onClose={submitting ? undefined : onClose}
      closeOnOverlayClick={!submitting}
      aria-labelledby={titleId}
      className="flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[32px] bg-surface shadow-[4px_4px_5px_rgba(169,169,169,0.2)] md:rounded-[32px]"
    >
      <form
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-8 md:px-10 md:py-10"
        onSubmit={handleSubmit}
      >
        <header className="flex items-center justify-between gap-3">
          <h2
            id={titleId}
            className="m-0 text-xl leading-8 font-bold text-foreground-strong md:text-2xl"
          >
            구매 요청
          </h2>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border-0 bg-transparent text-foreground-muted disabled:opacity-40"
            aria-label="닫기"
            disabled={submitting}
            onClick={onClose}
          >
            <Icon name="close" size="sm" />
          </button>
        </header>

        <div className="flex flex-col gap-3">
          <p className="m-0 text-base leading-[26px] font-semibold text-foreground-strong">
            요청 품목
          </p>
          <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {items.map((item) => {
                const lineTotal = item.product.price * item.quantity;
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="box-border flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
                        {item.product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.product.imageUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : null}
                      </span>
                      <div className="min-w-0">
                        <p className="m-0 truncate text-base leading-[26px] font-medium text-foreground-strong">
                          {item.product.name}
                        </p>
                        <p className="m-0 text-sm leading-6 text-foreground-muted">
                          {item.quantity}개 · {formatPrice(item.product.price)}
                        </p>
                      </div>
                    </div>
                    <strong className="shrink-0 text-base leading-[26px] text-foreground-strong">
                      {formatPrice(lineTotal)}
                    </strong>
                  </li>
                );
              })}
            </ul>
            <hr className="my-4 border-0 border-t border-border" />
            <div className="flex items-center justify-between gap-3">
              <span className="text-base leading-[26px] text-foreground-muted">
                총 {totalQuantity}개
              </span>
              <strong className="text-lg leading-[26px] font-bold text-accent">
                {formatPrice(orderTotal)}
              </strong>
            </div>
            <p className="mt-1 mb-0 text-sm leading-6 text-foreground-muted">
              상품금액 {formatPrice(productTotal)} · 배송비{" "}
              {formatPrice(shippingFee)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-base leading-[26px] font-semibold text-foreground-strong"
            htmlFor="purchase-request-message"
          >
            요청 메시지
          </label>
          <textarea
            id="purchase-request-message"
            aria-invalid={isMessageLimitExceeded}
            aria-describedby={
              isMessageLimitExceeded
                ? "purchase-request-message-error purchase-request-message-count"
                : "purchase-request-message-count"
            }
            className={[
              "min-h-28 w-full resize-y rounded-2xl border bg-surface px-4 py-3 text-base leading-[26px] text-foreground-strong outline-none placeholder:text-snack-gray-300",
              isMessageLimitExceeded
                ? "border-danger focus:border-danger"
                : "border-border focus:border-accent",
            ].join(" ")}
            placeholder="요청 메시지를 입력해주세요."
            value={message}
            onChange={handleMessageChange}
            disabled={submitting}
          />
          <div className="flex min-h-6 items-start justify-between gap-3 text-sm leading-6">
            {isMessageLimitExceeded ? (
              <p
                id="purchase-request-message-error"
                role="alert"
                className="m-0 text-danger"
              >
                요청 메시지는 500자까지 입력할 수 있어요.
              </p>
            ) : (
              <span aria-hidden="true" />
            )}
            <p
              id="purchase-request-message-count"
              className={[
                "m-0 shrink-0",
                isMessageLimitExceeded
                  ? "text-danger"
                  : "text-foreground-muted",
              ].join(" ")}
            >
              {message.length}/{MAX_REQUEST_MESSAGE_LENGTH}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="flex h-14 flex-1 items-center justify-center rounded-2xl border-0 bg-snack-background-500 text-lg font-semibold text-accent disabled:opacity-50"
            disabled={submitting}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="submit"
            className="flex h-14 flex-1 items-center justify-center rounded-2xl border-0 bg-accent text-lg font-semibold text-surface disabled:opacity-50"
            disabled={items.length === 0 || submitting}
          >
            {submitting ? "요청 중…" : "구매 요청하기"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
