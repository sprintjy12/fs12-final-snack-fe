"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { z } from "zod";

import { Button, Icon, ModalShell, Select, TextField, showToast } from "@/components/ui";
import { CATEGORY_MENU } from "@/constants/categoryConstants";
import { getProductPhotoSrc } from "@/lib/productMedia";
import { updateProduct } from "@/services/productApi";
import type { Product, UpdateProductInput } from "@/types/productTypes";

export type ProductEditModalProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  /** 수정 성공 시 호출 (목록/상세 갱신용) */
  onUpdated?: (product: Product) => void;
};

const CATEGORY_PLACEHOLDER = "카테고리";
const SUB_CATEGORY_PLACEHOLDER = "소분류";

const categoryOptions = [
  { value: "", label: CATEGORY_PLACEHOLDER },
  ...CATEGORY_MENU.map((category) => ({
    value: String(category.id),
    label: category.name,
  })),
];

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
  url: z.string().trim().optional(),
});

/**
 * 상품 수정 폼 모달. ProductRegisterModal과 같은 ModalShell 폼 패턴을 쓰되
 * 기존 상품 값으로 미리 채워지고, 제출 시 updateProduct를 호출합니다.
 * Figma: 상품상세_내가 등록한 상품/Desktop — 상품 수정
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

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [url, setUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 모달이 열릴 때(또는 대상 상품이 바뀔 때)만 기존 값으로 초기화합니다.
  // 매 렌더마다 초기화하면 사용자가 입력한 값이 리셋됩니다.
  useEffect(() => {
    if (!open || !product) return;
    setName(product.name);
    setCategoryId(String(product.categoryId));
    setSubCategoryId(String(product.subCategoryId));
    setPrice(String(product.price));
    setUrl(product.url ?? "");
    setImageFile(null);
    setImagePreview(getProductPhotoSrc(product.photo));
    setSubmitting(false);
  }, [open, product]);

  const selectedCategory = CATEGORY_MENU.find(
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
    // 대분류가 바뀌면 더는 유효하지 않은 소분류 선택을 초기화합니다.
    // 초기값 채우기(useEffect)와 달리 사용자가 직접 바꿀 때만 호출되므로
    // 프리필 값을 지워버리는 레이스가 없습니다.
    setSubCategoryId("");
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
    event.target.value = "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;

    const result = productEditSchema.safeParse({
      name,
      categoryId,
      subCategoryId,
      price,
      url,
    });

    if (!result.success) {
      showToast(result.error.issues[0]?.message ?? "입력값을 확인해 주세요.");
      return;
    }

    const input: UpdateProductInput = {
      id: product.id,
      name: result.data.name,
      price: result.data.price,
      url: result.data.url || undefined,
      // 새 이미지를 고르지 않았으면 기존 이미지를 유지합니다.
      photo: imageFile ? (imagePreview ?? undefined) : product.photo,
      categoryId: Number(result.data.categoryId),
      subCategoryId: Number(result.data.subCategoryId),
    };

    setSubmitting(true);
    try {
      const updated = await updateProduct(input);
      onUpdated?.(updated);
      showToast("상품을 수정했어요.");
      onClose();
    } catch {
      showToast("상품 수정에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
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
          onClick={onClose}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center bg-transparent text-snack-gray-400"
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
            />
          </label>

          <div className="flex w-full flex-col gap-3">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              상품 이미지
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex size-[88px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-muted xl:size-[104px]"
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
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="www.example.com"
            />
          </label>
        </div>

        <div className="flex w-full items-center justify-between gap-3 xl:gap-5">
          <Button
            type="button"
            variant="secondary"
            width="modal"
            className="flex-1"
            onClick={onClose}
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
