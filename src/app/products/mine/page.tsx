"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import axios from "axios";

import {
  EmptyState,
  Icon,
  Pagination,
  buildPaginationItems,
} from "@/components/ui";
import { useMyProducts } from "@/hooks/queries/useMyProducts";
import { useUrlPage } from "@/hooks/useUrlPage";
import { getProductPhotoSrc } from "@/lib/productMedia";
import type {
  MyProductListItem,
  MyProductSort,
} from "@/types/productTypes";

type SortValue = Exclude<MyProductSort, "popular">;

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "priceDesc", label: "가격 높은순" },
  { value: "priceAsc", label: "가격 낮은순" },
];

/** API 기본 limit과 동일 */
const PAGE_SIZE = 8;

const DESKTOP_GRID =
  "grid w-full grid-cols-[minmax(0,167px)_minmax(0,390px)_minmax(0,195px)_minmax(0,195px)_minmax(0,235px)] items-center gap-x-6 px-10 min-[1520px]:gap-x-10 min-[1520px]:px-20";

const formatPrice = (price: number) => price.toLocaleString("ko-KR");

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}`;
};

/** Figma: `www.codeit...` */
const formatUrlLabel = (url: string) => {
  const withoutProtocol = url.replace(/^https?:\/\//, "");
  return withoutProtocol.length > 10
    ? `${withoutProtocol.slice(0, 10)}...`
    : withoutProtocol;
};

const getCategoryLabel = (product: MyProductListItem) => {
  const leaf = product.category?.name?.trim();
  const parent = product.category?.parent?.name?.trim();

  if (parent && leaf) {
    return `${parent} · ${leaf}`;
  }

  return leaf || parent || "-";
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export default function MyProductsPage() {
  const router = useRouter();
  const { page, setPage } = useUrlPage();
  const [sort, setSort] = useState<SortValue>("latest");
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(
    () => new Set(),
  );

  const { data, isPending, isError, error } = useMyProducts({
    page,
    limit: PAGE_SIZE,
    sort,
  });

  const products = data?.data ?? [];
  const pagination = data?.pagination;
  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.totalPages ?? 0;
  const hasProducts = products.length > 0;

  const paginationItems = useMemo(
    () => buildPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  // 마지막 페이지에서 삭제 등으로 totalPages가 줄면 유효 페이지로 보정
  useEffect(() => {
    if (isPending || !pagination) {
      return;
    }

    if (pagination.totalPages <= 0) {
      if (page !== 1) {
        setPage(1);
      }
      return;
    }

    if (page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [isPending, page, pagination]);

  const handleImageError = (id: string) => {
    setFailedImageIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
  };

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSort(event.target.value as SortValue);
    setPage(1);
  };

  const goToProductDetail = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  return (
    <main className="min-h-screen bg-surface-muted pb-20 text-foreground">
      <section className="border-b border-border px-4 sm:px-6 xl:border-0 xl:px-[120px]">
        <div className="mx-auto flex h-14 max-w-[1680px] items-center sm:h-16 xl:h-36">
          <h1 className="text-lg leading-7 font-semibold text-foreground-strong sm:text-xl sm:leading-8 md:ml-2.5 xl:text-[32px] xl:leading-[42px]">
            상품 등록 내역
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1680px]">
        <section className="flex h-14 items-center justify-end border-b-2 border-border px-4 sm:h-16 sm:px-6 xl:h-[66px] xl:border-0 xl:px-0">
          <label className="relative block">
            <span className="sr-only">상품 등록 내역 정렬</span>
            <select
              value={sort}
              onChange={handleSortChange}
              className="h-9 w-[110px] appearance-none rounded-lg border border-snack-gray-200 bg-surface py-1.5 pr-7 pl-2 text-sm leading-6 font-normal text-foreground-muted outline-none focus:border-accent md:w-[130px] xl:h-[50px] xl:w-[150px] xl:px-3.5 xl:pr-10 xl:text-lg xl:leading-[26px]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Icon
              name="chevron-down"
              size="xs"
              className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-snack-gray-400 xl:right-3"
            />
          </label>
        </section>

        {isPending ? (
          <p className="px-4 py-16 text-center text-foreground-muted sm:px-6 xl:px-0">
            상품 등록 내역을 불러오는 중…
          </p>
        ) : null}

        {isError ? (
          <p
            role="alert"
            className="px-4 py-16 text-center text-snack-state-100 sm:px-6 xl:px-0"
          >
            {getErrorMessage(error, "상품 등록 내역을 불러오지 못했습니다.")}
          </p>
        ) : null}

        {!isPending && !isError ? (
          <>
            {hasProducts ? (
              <section aria-label="상품 등록 목록">
                {/* Desktop — Figma Card/상품등록 내역 lg (`1:10458`) */}
                <div className="hidden xl:block">
                  <div
                    className={`${DESKTOP_GRID} h-20 rounded-full border border-snack-gray-200 bg-surface text-xl leading-8 font-medium text-snack-black-100`}
                  >
                    <span className="pl-6 text-left">등록일</span>
                    <span className="pl-6 text-left">상품정보</span>
                    <span className="text-center">카테고리</span>
                    <span className="text-center">가격</span>
                    <span className="text-center">상품 링크</span>
                  </div>

                  <ul className="mt-4">
                    {products.map((product) => {
                      const photoSrc = getProductPhotoSrc(
                        product.imageUrl ?? "",
                      );
                      const showImage =
                        Boolean(photoSrc) && !failedImageIds.has(product.id);
                      const productUrl = product.productUrl ?? "";

                      return (
                        <li
                          key={product.id}
                          className={`${DESKTOP_GRID} cursor-pointer border-b border-border bg-surface-muted py-3 text-xl leading-8 hover:bg-surface`}
                          onClick={() => goToProductDetail(product.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              goToProductDetail(product.id);
                            }
                          }}
                          role="link"
                          tabIndex={0}
                          aria-label={`${product.name} 상세 보기`}
                        >
                          <span className="pl-6 text-left text-snack-black-100">
                            {formatDate(product.createdAt)}
                          </span>

                          <div className="flex min-w-0 items-center gap-4 pl-6">
                            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface shadow-[4px_4px_10px_rgba(250,247,243,0.25)]">
                              {showImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={photoSrc!}
                                  alt={product.name}
                                  className="size-full object-cover"
                                  onError={() => handleImageError(product.id)}
                                />
                              ) : (
                                <span
                                  aria-hidden="true"
                                  className="size-full rounded bg-snack-background-300"
                                />
                              )}
                            </div>
                            <p className="truncate font-semibold text-snack-black-200">
                              {product.name}
                            </p>
                          </div>

                          <span className="truncate text-center text-snack-black-100">
                            {getCategoryLabel(product)}
                          </span>
                          <span className="text-center text-snack-black-100">
                            {formatPrice(product.price)}
                          </span>
                          {productUrl ? (
                            <a
                              href={productUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              onClick={(event) => event.stopPropagation()}
                              className="flex min-w-0 items-center justify-center gap-2 text-snack-black-100 hover:text-accent"
                            >
                              <span className="truncate">
                                {formatUrlLabel(productUrl)}
                              </span>
                              <Icon name="link" size="md" label="상품 링크 열기" />
                            </a>
                          ) : (
                            <span className="text-center text-snack-gray-400">
                              -
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Mobile / tablet — 카드 */}
                <ul className="xl:hidden">
                  {products.map((product) => {
                    const photoSrc = getProductPhotoSrc(product.imageUrl ?? "");
                    const showImage =
                      Boolean(photoSrc) && !failedImageIds.has(product.id);
                    const productUrl = product.productUrl ?? "";

                    return (
                      <li
                        key={product.id}
                        className="cursor-pointer border-b-2 border-border px-4 py-5 hover:bg-surface sm:px-6 sm:py-6"
                        onClick={() => goToProductDetail(product.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            goToProductDetail(product.id);
                          }
                        }}
                        role="link"
                        tabIndex={0}
                        aria-label={`${product.name} 상세 보기`}
                      >
                        <div className="flex min-h-[88px] gap-3 sm:h-[100px] sm:gap-4">
                          <div className="flex size-[88px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface shadow-[4px_4px_10px_rgba(250,247,243,0.25)] sm:size-[100px]">
                            {showImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={photoSrc!}
                                alt={product.name}
                                className="size-full object-cover"
                                onError={() => handleImageError(product.id)}
                              />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="size-full rounded bg-snack-background-300"
                              />
                            )}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div className="min-w-0">
                              <p className="text-sm leading-6 font-semibold text-foreground-strong md:text-base md:leading-7">
                                {product.name}
                              </p>
                              <p className="text-xs leading-[18px] text-foreground-muted md:text-sm md:leading-6">
                                {getCategoryLabel(product)}
                              </p>
                            </div>
                            {productUrl ? (
                              <a
                                href={productUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                onClick={(event) => event.stopPropagation()}
                                className="inline-flex max-w-full items-center gap-1 text-[13px] leading-[22px] font-medium text-accent"
                              >
                                <span className="truncate">
                                  {formatUrlLabel(productUrl)}
                                </span>
                                <Icon
                                  name="link"
                                  size="sm"
                                  label="상품 링크 열기"
                                />
                              </a>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-b border-snack-gray-200 py-3 text-sm leading-6 font-semibold text-foreground-strong md:text-base md:leading-7">
                          <span>가격</span>
                          <span>{formatPrice(product.price)}원</span>
                        </div>

                        <dl className="mt-3 space-y-2 text-sm leading-6 text-foreground-muted">
                          <div className="flex items-center justify-between gap-4">
                            <dt className="shrink-0">등록일</dt>
                            <dd className="min-w-0 text-right font-medium">
                              {formatDate(product.createdAt)}
                            </dd>
                          </div>
                        </dl>
                      </li>
                    );
                  })}
                </ul>

                <Pagination
                  aria-label="상품 등록 내역 페이지"
                  items={paginationItems}
                  currentPage={String(currentPage)}
                  previousDisabled={currentPage <= 1}
                  nextDisabled={currentPage >= totalPages}
                  onPrevious={() => setPage(Math.max(1, page - 1))}
                  onNext={() =>
                    setPage(page < totalPages ? page + 1 : page)
                  }
                  onPageSelect={(selected) => {
                    const nextPage = Number(selected);
                    if (Number.isInteger(nextPage) && nextPage > 0) {
                      setPage(nextPage);
                    }
                  }}
                  className="mt-4 py-2 md:mt-8 md:py-0 xl:mt-10"
                />
              </section>
            ) : (
              <div className="flex flex-col items-center gap-6 px-4 sm:px-6 xl:gap-10 xl:px-0">
                <EmptyState
                  aria-label="등록한 상품 없음"
                  image="empty-purchase"
                  className="pt-16 md:pt-40 xl:pt-[179px]"
                  contentClassName="h-[202px] w-full max-w-[327px] xl:h-[304px] xl:max-w-[388px]"
                  description="등록한 상품이 없어요"
                />
                <Link
                  href="/products/new"
                  className="inline-flex w-full max-w-[327px] items-center justify-center rounded-lg bg-accent px-6 py-3 text-base leading-6 font-semibold text-surface sm:w-auto sm:text-lg sm:leading-[26px]"
                >
                  상품 등록하러 가기
                </Link>
              </div>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}
