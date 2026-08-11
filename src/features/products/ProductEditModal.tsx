"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { z } from "zod";

import { ensureAccessToken } from "@/api/authApi";
import { Button, Icon, ModalShell, Select, TextField, showToast } from "@/components/ui";
import {
  CATEGORY_MENU,
  getActiveCategoryMenu,
  type CategoryMenuItem,
} from "@/constants/categoryConstants";
import { useUploadImage } from "@/hooks/mutations/useUploadImage";
import { getProductPhotoSrc } from "@/lib/productMedia";
import { ensureCategoryMenu, updateProduct } from "@/services/productApi";
import type { Product, UpdateProductInput } from "@/types/productTypes";

export type ProductEditModalProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  /** 수정 성공 시 호출 (목록/상세 갱신용) */
  onUpdated?: (product: Product) => void;
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

const productEditSchema = z.object({
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

/**
 * 상품 수정 폼 모달.
 * 열릴 때 product의 대·소분류 ID로 Select를 채우고,
 * PATCH /api/products/:id 로 부분 수정합니다.
 */
export function ProductEditModal({
  open,
  product,
  onClose,
  onUpdated,
}: ProductEditModalProps) {
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
  const [submitting, setSubmitting] = useState(false);

  // 모달이 열릴 때(또는 대상 상품이 바뀔 때)만 기존 값 + BE 카테고리 메뉴로 초기화
  useEffect(() => {
    if (!open || !product) {
      return;
    }

    setName(product.name);
    setCategoryId(String(product.categoryId ?? ""));
    setSubCategoryId(String(product.subCategoryId ?? ""));
    setPrice(String(product.price));
    setProductUrl(product.url ?? "");
    setImageFile(null);
    setImagePreview(getProductPhotoSrc(product.photo));
    setSubmitting(false);

    void ensureCategoryMenu()
      .then(() => {
        setCategoryMenu(getActiveCategoryMenu());
        // 메뉴 로드 후 다시 반영 (옵션이 생긴 뒤 Select value 매칭)
        setCategoryId(String(product.categoryId ?? ""));
        setSubCategoryId(String(product.subCategoryId ?? ""));
      })
      .catch(() => {
        setCategoryMenu(getActiveCategoryMenu());
        setCategoryId(String(product.categoryId ?? ""));
        setSubCategoryId(String(product.subCategoryId ?? ""));
      });
  }, [open, product]);

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

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setSubCategoryId("");
  };

  useEffect(() => {
    if (!imageFile) {
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    event.target.value = "";
  };

  const handleClose = () => {
    if (submitting) {
      return;
    }
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product || submitting) {
      return;
    }

    const result = productEditSchema.safeParse({
      name,
      categoryId,
      subCategoryId,
      price,
      productUrl,
    });

    if (!result.success) {
      showToast(result.error.issues[0]?.message ?? "입력값을 확인해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await ensureAccessToken();

      let imageUrl: string | undefined;
      if (imageFile) {
        const uploaded = await uploadImageMutation.mutateAsync(imageFile);
        imageUrl = uploaded.url;
      }

      const input: UpdateProductInput = {
        id: product.id,
        name: result.data.name,
        price: result.data.price,
        categoryId: result.data.categoryId,
        subCategoryId: result.data.subCategoryId,
        productUrl: result.data.productUrl,
        ...(imageUrl ? { imageUrl } : {}),
      };

      const updated = await updateProduct(input);
      onUpdated?.(updated);
      showToast("상품을 수정했어요.");
      onClose();
    } catch (error) {
      const message = isAxiosError(error)
        ? ((error.response?.data as { message?: string } | undefined)
            ?.message ?? error.message)
        : error instanceof Error
          ? error.message
          : "상품 수정에 실패했어요. 잠시 후 다시 시도해 주세요.";
      showToast(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) {
    return null;
  }

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      closeOnOverlayClick={!submitting}
      aria-labelledby={titleId}
      className="flex max-h-[90vh] max-w-[375px] flex-col gap-6 overflow-y-auto p-6 xl:max-w-[688px] xl:gap-8 xl:px-8 xl:pt-12 xl:pb-10"
    >
      <div className="flex w-full items-center justify-between">
        <h2
          id={titleId}
          className="text-xl leading-8 font-bold text-foreground-strong xl:text-2xl"
        >
          상품 수정
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
        className="flex w-full flex-col gap-6 xl:gap-8"
      >
        <div className="flex w-full flex-col gap-6 xl:gap-8">
          <label className="flex w-full flex-col gap-3">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              상품명
            </span>
            <TextField
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="상품명을 입력해 주세요"
              disabled={submitting}
            />
          </label>

          <div className="flex w-full flex-col gap-3">
            <span
              id={categoryLabelId}
              className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8"
            >
              카테고리
            </span>
            <div className="flex w-full items-center gap-3">
              <Select
                options={categoryOptions}
                value={categoryId}
                onChange={handleCategoryChange}
                labelId={categoryLabelId}
              />
              <Select
                options={subCategoryOptions}
                value={subCategoryId}
                onChange={setSubCategoryId}
                labelId={subCategoryLabelId}
                aria-label="소분류"
              />
            </div>
          </div>

          <label className="flex w-full flex-col gap-3">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              가격
            </span>
            <TextField
              type="text"
              inputMode="numeric"
              value={price}
              onChange={(event) =>
                setPrice(event.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="가격을 입력해 주세요"
              disabled={submitting}
            />
          </label>

          <div className="flex w-full flex-col gap-3">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              상품 이미지
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              className="relative flex size-[88px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-muted disabled:cursor-not-allowed xl:size-[104px]"
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <label className="flex w-full flex-col gap-3">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              제품링크
            </span>
            <TextField
              type="text"
              value={productUrl}
              onChange={(event) => setProductUrl(event.target.value)}
              placeholder="https://example.com/product"
              disabled={submitting}
            />
          </label>
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
            {submitting ? "수정 중…" : "수정하기"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
