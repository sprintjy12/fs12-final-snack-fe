"use client";

import {
  useEffect,
  useId,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";

import { Icon, showToast } from "@/components/ui";
import {
  CATEGORY_MENU_ORDERED,
  findCategoryMenuItem,
  findSubCategoryMenuItem,
} from "@/constants/categoryConstants";
import { useCategories } from "@/hooks/useProducts";
import { getProductPhotoSrc } from "@/lib/productMedia";
import { isProductApiMock } from "@/services/productApi";
import type { Product } from "@/types/productTypes";

export type EditProductModalProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmit?: (payload: EditProductPayload) => void;
};

export type EditProductPayload = {
  id: Product["id"];
  name: string;
  categoryId: Product["categoryId"];
  subCategoryId: Product["subCategoryId"];
  price: number;
  photo: string;
  url: string;
};

function formatPriceInput(value: number) {
  if (!Number.isFinite(value) || value < 0) return "";
  return value.toLocaleString("ko-KR");
}

function parsePriceInput(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number(digits);
}

/**
 * Figma `상품 수정` 모달 — 상품명·카테고리·가격·이미지·링크
 */
export function EditProductModal({
  open,
  product,
  onClose,
  onSubmit,
}: EditProductModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [subCategoryId, setSubCategoryId] = useState<string>("");
  const [priceText, setPriceText] = useState("");
  const [photo, setPhoto] = useState("");
  const [url, setUrl] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const useApiIds = !isProductApiMock();
  const { data: categoryMenu = CATEGORY_MENU_ORDERED } = useCategories();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !product) return;

    setName(product.name);
    setCategoryId(String(product.categoryId));
    setSubCategoryId(String(product.subCategoryId));
    setPriceText(formatPriceInput(product.price));
    setPhoto(product.photo ?? "");
    setUrl(product.url ?? "");
    setImageFailed(false);
  }, [open, product]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const activeCategory =
    findCategoryMenuItem(categoryId) ??
    categoryMenu.find(
      (item) => String(item.id) === categoryId || item.apiId === categoryId,
    );
  const subOptions = activeCategory?.subCategories ?? [];

  const photoSrc = getProductPhotoSrc(photo);
  const showImage = Boolean(photoSrc) && !imageFailed;

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleCategoryChange = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);
    const next = findCategoryMenuItem(nextCategoryId);
    const firstSub = next?.subCategories[0];
    setSubCategoryId(
      firstSub
        ? String(useApiIds ? firstSub.apiId : firstSub.id)
        : "",
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;

    const trimmedName = name.trim();
    const price = parsePriceInput(priceText);
    if (!trimmedName) {
      showToast("상품명을 입력해 주세요.");
      return;
    }
    if (price <= 0) {
      showToast("가격을 입력해 주세요.");
      return;
    }

    const resolvedCategory =
      findCategoryMenuItem(categoryId) ?? activeCategory;
    const resolvedSub =
      findSubCategoryMenuItem(categoryId, subCategoryId) ??
      subOptions.find(
        (sub) =>
          String(sub.id) === subCategoryId || sub.apiId === subCategoryId,
      );

    const payload: EditProductPayload = {
      id: product.id,
      name: trimmedName,
      categoryId: resolvedCategory
        ? useApiIds
          ? resolvedCategory.apiId
          : resolvedCategory.id
        : product.categoryId,
      subCategoryId: resolvedSub
        ? useApiIds
          ? resolvedSub.apiId
          : resolvedSub.id
        : product.subCategoryId,
      price,
      photo,
      url: url.trim(),
    };

    // TODO: 상품 수정 API 연동
    onSubmit?.(payload);
    showToast("상품 정보가 수정되었습니다.");
    onClose();
  };

  if (!mounted || !open || !product) return null;

  const fieldClass =
    "box-border h-14 w-full rounded-2xl border border-border bg-surface px-4 text-base leading-[26px] text-foreground-strong outline-none placeholder:text-snack-gray-300 focus:border-accent";
  const labelClass =
    "m-0 text-base leading-[26px] font-semibold text-foreground-strong";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-snack-black-500/40 px-0 md:items-center md:px-6"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92vh] w-full max-w-[375px] flex-col overflow-hidden rounded-t-[32px] bg-surface-muted shadow-[4px_4px_5px_rgba(169,169,169,0.2)] md:max-w-[640px] md:rounded-[32px]"
      >
        <form
          className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-8 md:gap-8 md:px-10 md:py-10"
          onSubmit={handleSubmit}
        >
          <h2
            id={titleId}
            className="m-0 text-left text-xl leading-8 font-bold text-foreground-strong md:text-2xl"
          >
            상품 수정
          </h2>

          <div className="flex flex-col gap-5 md:gap-6">
            <label className="flex flex-col gap-2">
              <span className={labelClass}>상품명</span>
              <input
                className={fieldClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="상품명을 입력해 주세요"
                autoComplete="off"
              />
            </label>

            <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
              <legend className={labelClass}>카테고리</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="relative block">
                  <span className="sr-only">대분류</span>
                  <select
                    className={`${fieldClass} appearance-none pr-10`}
                    value={categoryId}
                    onChange={(event) =>
                      handleCategoryChange(event.target.value)
                    }
                  >
                    {categoryMenu.map((category) => {
                      const value = String(
                        useApiIds ? category.apiId : category.id,
                      );
                      return (
                        <option key={value} value={value}>
                          {category.name}
                        </option>
                      );
                    })}
                  </select>
                  <Icon
                    name="chevron-down"
                    size="sm"
                    className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-snack-gray-400"
                  />
                </label>

                <label className="relative block">
                  <span className="sr-only">소분류</span>
                  <select
                    className={`${fieldClass} appearance-none pr-10`}
                    value={subCategoryId}
                    onChange={(event) => setSubCategoryId(event.target.value)}
                    disabled={subOptions.length === 0}
                  >
                    {subOptions.map((sub) => {
                      const value = String(useApiIds ? sub.apiId : sub.id);
                      return (
                        <option key={value} value={value}>
                          {sub.name}
                        </option>
                      );
                    })}
                  </select>
                  <Icon
                    name="chevron-down"
                    size="sm"
                    className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-snack-gray-400"
                  />
                </label>
              </div>
            </fieldset>

            <label className="flex flex-col gap-2">
              <span className={labelClass}>가격</span>
              <input
                className={fieldClass}
                inputMode="numeric"
                value={priceText}
                onChange={(event) =>
                  setPriceText(formatPriceInput(parsePriceInput(event.target.value)))
                }
                placeholder="가격을 입력해 주세요"
                autoComplete="off"
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className={labelClass}>상품 이미지</span>
              {showImage ? (
                <div className="relative size-[120px] overflow-hidden rounded-2xl border border-border bg-surface md:size-[140px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoSrc!}
                    alt=""
                    className="size-full object-contain p-3"
                    onError={() => setImageFailed(true)}
                  />
                  <button
                    type="button"
                    aria-label="이미지 제거"
                    className="absolute top-2 right-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-snack-black-500/70 text-surface"
                    onClick={() => {
                      setPhoto("");
                      setImageFailed(false);
                    }}
                  >
                    <Icon name="close" size="sm" />
                  </button>
                </div>
              ) : (
                <p className="m-0 text-sm leading-6 text-snack-gray-400">
                  등록된 이미지가 없습니다.
                </p>
              )}
            </div>

            <label className="flex flex-col gap-2">
              <span className={labelClass}>제품링크</span>
              <input
                className={fieldClass}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="www.example.com"
                autoComplete="off"
              />
            </label>
          </div>

          <div className="mt-auto flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between sm:gap-5">
            <button
              type="button"
              onClick={onClose}
              className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-2xl bg-snack-background-500 text-base leading-[26px] font-semibold text-accent md:h-16 md:flex-1 md:text-xl md:leading-8"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-2xl bg-accent text-base leading-[26px] font-semibold text-surface md:h-16 md:flex-1 md:text-xl md:leading-8"
            >
              수정하기
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
