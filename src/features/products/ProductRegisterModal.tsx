"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { z } from "zod";

import { Button, Icon, ModalShell, Select, TextField, showToast } from "@/components/ui";
import {
  CATEGORY_MENU,
  getActiveCategoryMenu,
  type CategoryMenuItem,
} from "@/constants/categoryConstants";
import { ensureAccessToken } from "@/api/authApi";
import { useUploadImage } from "@/hooks/mutations/useUploadImage";
import { createProduct, ensureCategoryMenu } from "@/services/productApi";
import type { CreateProductInput, Product } from "@/types/productTypes";

export type ProductRegisterModalProps = {
  open: boolean;
  onClose: () => void;
  /** 등록 성공 시 호출 (목록 갱신용) */
  onCreated?: (product: Product) => void;
};

const CATEGORY_PLACEHOLDER = "대분류";
const SUB_CATEGORY_PLACEHOLDER = "소분류";

function normalizeHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const productRegisterSchema = z.object({
  name: z.string().trim().min(1, "상품명을 입력해 주세요."),
  categoryId: z.string().min(1, "카테고리를 선택해 주세요."),
  subCategoryId: z.string().min(1, "소분류를 선택해 주세요."),
  price: z
    .string()
    .trim()
    .min(1, "가격을 입력해 주세요.")
    .refine((value) => /^\d+$/.test(value), "가격은 숫자만 입력해 주세요.")
    .transform((value) => Number(value))
    .refine((value) => value > 0, "가격은 0보다 커야 해요."),
  productUrl: z
    .string()
    .trim()
    .min(1, "제품 링크를 입력해 주세요.")
    .transform(normalizeHttpUrl)
    .refine(
      (value) => z.string().url().safeParse(value).success,
      "올바른 URL을 입력해 주세요.",
    ),
});

type FieldErrors = {
  name?: string;
  categoryId?: string;
  subCategoryId?: string;
  price?: string;
  productUrl?: string;
  image?: string;
};

const FieldError = ({ id, message }: { id: string; message?: string }) => {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="pl-2 text-sm leading-[26px] font-medium text-danger"
    >
      {message}
    </p>
  );
};

function getFieldErrorsFromZod(
  error: z.ZodError<z.infer<typeof productRegisterSchema>>,
): FieldErrors {
  const { fieldErrors } = z.flattenError(error);
  return {
    name: fieldErrors.name?.[0],
    categoryId: fieldErrors.categoryId?.[0],
    subCategoryId: fieldErrors.subCategoryId?.[0],
    price: fieldErrors.price?.[0],
    productUrl: fieldErrors.productUrl?.[0],
  };
}

function getRegisterToastMessage(errors: FieldErrors) {
  const missingLabels = (
    [
      ["name", "상품명"],
      ["categoryId", "카테고리"],
      ["subCategoryId", "소분류"],
      ["price", "가격"],
      ["image", "이미지"],
      ["productUrl", "제품 링크"],
    ] as const
  )
    .filter(([key]) => Boolean(errors[key]))
    .map(([, label]) => label);

  if (missingLabels.length > 1) {
    return "필수 항목을 모두 입력해 주세요.";
  }

  return (
    errors.name ??
    errors.categoryId ??
    errors.subCategoryId ??
    errors.price ??
    errors.image ??
    errors.productUrl ??
    "입력값을 확인해 주세요."
  );
}

/**
 * 상품 등록 폼 모달.
 * ProductEditModal과 같은 ModalShell 폼 패턴.
 * Figma: 상품 리스트 — 상품 등록
 */
export function ProductRegisterModal({
  open,
  onClose,
  onCreated,
}: ProductRegisterModalProps) {
  const titleId = useId();
  const categoryLabelId = useId();
  const subCategoryLabelId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadImage();

  const [categoryMenu, setCategoryMenu] =
    useState<CategoryMenuItem[]>(CATEGORY_MENU);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setName("");
    setCategoryId("");
    setSubCategoryId("");
    setPrice("");
    setProductUrl("");
    setImageFile(null);
    setImagePreview(null);
    setFieldErrors({});
    setSubmitting(false);

    void ensureCategoryMenu()
      .then(() => setCategoryMenu(getActiveCategoryMenu()))
      .catch(() => setCategoryMenu(getActiveCategoryMenu()));
  }, [open]);

  const categoryOptions = [
    { value: "", label: CATEGORY_PLACEHOLDER },
    ...categoryMenu.map((category) => ({
      value: String(category.id),
      label: category.name,
    })),
  ];

  const selectedCategory = categoryMenu.find(
    (category) => String(category.id) === categoryId,
  );
  const subCategoryOptions = [
    { value: "", label: SUB_CATEGORY_PLACEHOLDER },
    ...(selectedCategory?.subCategories.map((sub) => ({
      value: String(sub.id),
      label: sub.name,
    })) ?? []),
  ];

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setSubCategoryId("");
    clearFieldError("categoryId");
    clearFieldError("subCategoryId");
  };

  useEffect(() => {
    if (!imageFile) return;
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    clearFieldError("image");
    event.target.value = "";
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const result = productRegisterSchema.safeParse({
      name,
      categoryId,
      subCategoryId,
      price,
      productUrl,
    });

    const errors: FieldErrors = result.success
      ? {}
      : getFieldErrorsFromZod(result.error);

    if (!imageFile) {
      errors.image = "이미지를 등록해 주세요.";
    }

    if (!result.success || !imageFile) {
      setFieldErrors(errors);
      showToast(getRegisterToastMessage(errors));
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      await ensureAccessToken();

      const uploaded = await uploadImageMutation.mutateAsync(imageFile);

      const input: CreateProductInput = {
        name: result.data.name,
        price: result.data.price,
        // 모달에 재고 입력이 없어 API 필수값(≥1)은 기본 1로 보냅니다.
        stock: 1,
        productUrl: result.data.productUrl,
        imageUrl: uploaded.url,
        categoryId: result.data.categoryId,
        subCategoryId: result.data.subCategoryId,
      };

      const created = await createProduct(input);
      onClose();
      onCreated?.(created);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "상품 등록에 실패했어요. 잠시 후 다시 시도해 주세요.";
      showToast(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      closeOnOverlayClick={!submitting}
      aria-labelledby={titleId}
      className="flex max-h-[90vh] max-w-[375px] flex-col gap-8 overflow-y-auto px-6 pt-8 pb-10 md:max-w-[375px] xl:max-w-[688px] xl:gap-8 xl:px-6 xl:pt-8 xl:pb-10"
    >
      <div className="flex w-full items-center justify-between">
        <h2
          id={titleId}
          className="text-xl leading-8 font-bold text-foreground-strong xl:text-2xl"
        >
          상품 등록
        </h2>
        <button
          type="button"
          aria-label="닫기"
          onClick={handleClose}
          disabled={submitting}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center bg-transparent text-snack-gray-400 disabled:cursor-not-allowed"
        >
          <Icon name="close" size="sm" />
        </button>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-8"
      >
        <div className="flex w-full flex-col gap-8">
          <div className="flex w-full flex-col gap-3">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              상품명
            </span>
            <div className="flex w-full flex-col gap-1">
              <TextField
                type="text"
                value={name}
                error={Boolean(fieldErrors.name)}
                aria-describedby={
                  fieldErrors.name ? "product-name-error" : undefined
                }
                onChange={(event) => {
                  setName(event.target.value);
                  clearFieldError("name");
                }}
                placeholder="상품명을 입력해주세요."
              />
              <FieldError id="product-name-error" message={fieldErrors.name} />
            </div>
          </div>

          <div className="flex w-full flex-col gap-3">
            <span
              id={categoryLabelId}
              className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8"
            >
              카테고리
            </span>
            <div className="flex w-full flex-col gap-1">
              <div className="flex w-full items-center gap-3">
                <Select
                  options={categoryOptions}
                  value={categoryId}
                  onChange={handleCategoryChange}
                  labelId={categoryLabelId}
                  className={
                    fieldErrors.categoryId
                      ? "[&_button]:border-danger"
                      : undefined
                  }
                />
                <Select
                  options={subCategoryOptions}
                  value={subCategoryId}
                  onChange={(value) => {
                    setSubCategoryId(value);
                    clearFieldError("subCategoryId");
                  }}
                  labelId={subCategoryLabelId}
                  aria-label="소분류"
                  className={
                    fieldErrors.subCategoryId
                      ? "[&_button]:border-danger"
                      : undefined
                  }
                />
              </div>
              <FieldError
                id="product-category-error"
                message={
                  fieldErrors.categoryId ?? fieldErrors.subCategoryId
                }
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-3">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              가격
            </span>
            <div className="flex w-full flex-col gap-1">
              <TextField
                type="text"
                inputMode="numeric"
                value={price}
                error={Boolean(fieldErrors.price)}
                aria-describedby={
                  fieldErrors.price ? "product-price-error" : undefined
                }
                onChange={(event) => {
                  setPrice(event.target.value.replace(/[^0-9]/g, ""));
                  clearFieldError("price");
                }}
                placeholder="가격을 입력해주세요."
              />
              <FieldError
                id="product-price-error"
                message={fieldErrors.price}
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-3">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              상품 이미지
            </span>
            <div className="flex w-full flex-col gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
                aria-describedby={
                  fieldErrors.image ? "product-image-error" : undefined
                }
                className={[
                  "relative flex size-[88px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-surface-muted disabled:cursor-not-allowed xl:size-[104px]",
                  fieldErrors.image
                    ? "border border-danger"
                    : "border border-border",
                ].join(" ")}
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="상품 이미지 미리보기"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <Icon name="plus" size="md" className="text-snack-gray-400" />
                )}
              </button>
              <FieldError
                id="product-image-error"
                message={fieldErrors.image}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="flex w-full flex-col gap-3">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              제품링크
            </span>
            <div className="flex w-full flex-col gap-1">
              <TextField
                type="text"
                value={productUrl}
                error={Boolean(fieldErrors.productUrl)}
                aria-describedby={
                  fieldErrors.productUrl ? "product-url-error" : undefined
                }
                onChange={(event) => {
                  setProductUrl(event.target.value);
                  clearFieldError("productUrl");
                }}
                placeholder="https://example.com/product"
              />
              <FieldError
                id="product-url-error"
                message={fieldErrors.productUrl}
              />
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3 xl:gap-5">
          <Button
            type="button"
            variant="secondary"
            width="modal"
            className="flex-1"
            disabled={submitting}
            onClick={handleClose}
          >
            취소
          </Button>
          <Button
            type="submit"
            width="modal"
            className="flex-1"
            disabled={submitting}
          >
            {submitting ? "등록 중…" : "등록하기"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
