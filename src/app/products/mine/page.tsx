"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState, Icon } from "@/components/ui";
import { getProductPhotoSrc } from "@/lib/productMedia";

type MyProduct = {
  id: number;
  /** 화면 표시용 (예: 2024. 07. 04) */
  registeredAt: string;
  /** 정렬용 ISO 날짜 (YYYY-MM-DD) */
  registeredAtIso: string;
  name: string;
  categoryLabel: string;
  price: number;
  photo: string;
  productUrl: string;
};

type SortValue = "latest" | "priceDesc" | "priceAsc";

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "priceDesc", label: "가격 높은순" },
  { value: "priceAsc", label: "가격 낮은순" },
];

/** Figma Card/상품등록 내역 lg (`1:10458`) 더미 */
const MY_PRODUCTS: MyProduct[] = [
  {
    id: 1,
    registeredAt: "2024. 07. 04",
    registeredAtIso: "2024-07-04",
    name: "코카콜라 제로",
    categoryLabel: "청량・탄산음료",
    price: 1900,
    photo: "코카콜라_제로.png",
    productUrl: "https://www.codeit.kr",
  },
  {
    id: 2,
    registeredAt: "2024. 07. 02",
    registeredAtIso: "2024-07-02",
    name: "스프라이트",
    categoryLabel: "청량・탄산음료",
    price: 2000,
    photo: "스프라이트.png",
    productUrl: "https://www.codeit.kr",
  },
  {
    id: 3,
    registeredAt: "2024. 07. 01",
    registeredAtIso: "2024-07-01",
    name: "환타 오렌지",
    categoryLabel: "청량・탄산음료",
    price: 2000,
    photo: "환타_오렌지.png",
    productUrl: "https://www.codeit.kr",
  },
  {
    id: 4,
    registeredAt: "2024. 06. 30",
    registeredAtIso: "2024-06-30",
    name: "코카콜라",
    categoryLabel: "청량・탄산음료",
    price: 2000,
    photo: "코카콜라.png",
    productUrl: "https://www.codeit.kr",
  },
];

const formatPrice = (price: number) => price.toLocaleString("ko-KR");

/** Figma: `www.codeit...` */
const formatUrlLabel = (url: string) => {
  const withoutProtocol = url.replace(/^https?:\/\//, "");
  return withoutProtocol.length > 10
    ? `${withoutProtocol.slice(0, 10)}...`
    : withoutProtocol;
};

export default function MyProductsPage() {
  const [sort, setSort] = useState<SortValue>("latest");
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(
    () => new Set(),
  );

  const handleImageError = (id: number) => {
    setFailedImageIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
  };

  const sortedProducts = useMemo(() => {
    const items = [...MY_PRODUCTS];
    switch (sort) {
      case "priceDesc":
        return items.sort((a, b) => b.price - a.price);
      case "priceAsc":
        return items.sort((a, b) => a.price - b.price);
      case "latest":
      default:
        return items.sort((a, b) =>
          b.registeredAtIso.localeCompare(a.registeredAtIso),
        );
    }
  }, [sort]);

  const hasProducts = sortedProducts.length > 0;

  return (
    <main className="min-h-screen bg-surface-muted pb-20 text-foreground">
      <section className="border-b border-border px-6 xl:border-0 xl:px-[120px]">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center xl:h-36">
          <h1 className="text-xl leading-8 font-semibold text-foreground-strong md:ml-2.5 xl:text-[32px] xl:leading-[42px]">
            상품 등록 내역
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1680px]">
        <section className="flex h-16 items-center justify-end border-b-2 border-border px-6 xl:h-[66px] xl:border-0 xl:px-0">
          <label className="relative block">
            <span className="sr-only">상품 등록 내역 정렬</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortValue)}
              className="h-9 w-[110px] appearance-none rounded-lg border border-snack-gray-200 bg-surface py-1.5 pr-7 pl-2 text-sm leading-6 font-normal text-foreground-muted outline-none focus:border-accent xl:h-[50px] xl:w-[150px] xl:px-3.5 xl:pr-10 xl:text-lg xl:leading-[26px]"
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

        <section
          aria-label="상품 등록 목록"
          className={hasProducts ? undefined : "hidden"}
        >
          {/* Desktop — Figma Card/상품등록 내역 lg (`1:10458`) */}
          <div className="hidden xl:block">
            <div className="flex h-20 items-center justify-between rounded-full border border-snack-gray-200 bg-surface px-20 text-xl leading-8 font-medium text-snack-black-100">
              <span className="flex h-20 w-[167px] shrink-0 items-center justify-center pl-6">
                등록일
              </span>
              <span className="flex h-20 w-[390px] shrink-0 items-center pl-6 text-left">
                상품정보
              </span>
              <div className="flex shrink-0 items-center gap-10">
                <span className="flex h-20 w-[195px] items-center justify-center">
                  카테고리
                </span>
                <span className="flex h-20 w-[195px] items-center justify-center">
                  가격
                </span>
                <span className="flex h-20 w-[235px] items-center justify-center">
                  상품 링크
                </span>
              </div>
            </div>

            <ul className="mt-4">
              {sortedProducts.map((product) => {
                const photoSrc = getProductPhotoSrc(product.photo);
                const showImage =
                  Boolean(photoSrc) && !failedImageIds.has(product.id);

                return (
                  <li
                    key={product.id}
                    className="flex items-center justify-between border-b border-border bg-surface-muted px-20 py-3 text-xl leading-8"
                  >
                    <span className="flex h-20 w-[167px] shrink-0 items-center pl-6 text-snack-black-100">
                      {product.registeredAt}
                    </span>

                    <div className="flex h-20 w-[390px] shrink-0 items-center gap-4 pl-6">
                      <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-border bg-surface p-6 shadow-[4px_4px_10px_rgba(250,247,243,0.25)]">
                        {showImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photoSrc!}
                            alt={product.name}
                            className="size-full object-contain"
                            onError={() => handleImageError(product.id)}
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="size-full rounded bg-snack-background-300"
                          />
                        )}
                      </div>
                      <p className="font-semibold text-snack-black-200">
                        {product.name}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-10">
                      <span className="flex h-20 w-[195px] items-center justify-center text-snack-black-100">
                        {product.categoryLabel}
                      </span>
                      <span className="flex h-20 w-[195px] items-center justify-center text-snack-black-100">
                        {formatPrice(product.price)}
                      </span>
                      <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex h-20 w-[235px] items-center justify-center gap-2 text-snack-black-100 hover:text-accent"
                      >
                        <span>{formatUrlLabel(product.productUrl)}</span>
                        <Icon name="link" size="md" label="상품 링크 열기" />
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Mobile — 구매요청 내역 카드 패턴 준용 */}
          <ul className="xl:hidden">
            {sortedProducts.map((product) => {
              const photoSrc = getProductPhotoSrc(product.photo);
              const showImage =
                Boolean(photoSrc) && !failedImageIds.has(product.id);

              return (
                <li
                  key={product.id}
                  className="border-b-2 border-border px-6 py-6"
                >
                  <div className="flex h-[100px] gap-4">
                    <div className="flex size-[100px] shrink-0 items-center justify-center rounded-lg border border-border bg-surface p-3 shadow-[4px_4px_10px_rgba(250,247,243,0.25)]">
                      {showImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photoSrc!}
                          alt={product.name}
                          className="size-full object-contain"
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
                      <div>
                        <p className="text-sm leading-6 font-semibold text-foreground-strong">
                          {product.name}
                        </p>
                        <p className="text-xs leading-[18px] text-foreground-muted">
                          {product.categoryLabel}
                        </p>
                      </div>
                      <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex max-w-full items-center gap-1 text-[13px] leading-[22px] font-medium text-accent"
                      >
                        <span className="truncate">
                          {formatUrlLabel(product.productUrl)}
                        </span>
                        <Icon name="link" size="sm" label="상품 링크 열기" />
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-b border-snack-gray-200 py-3 text-sm leading-6 font-semibold text-foreground-strong">
                    <span>가격</span>
                    <span>{formatPrice(product.price)}원</span>
                  </div>

                  <dl className="mt-3 space-y-2 text-sm leading-6 text-foreground-muted">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="shrink-0">등록일</dt>
                      <dd className="min-w-0 text-right font-medium">
                        {product.registeredAt}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        </section>

        {!hasProducts ? (
          <div className="flex flex-col items-center gap-6 xl:gap-10">
            <EmptyState
              aria-label="등록한 상품 없음"
              image="empty-purchase"
              className="pt-16 md:pt-40 xl:pt-[179px]"
              contentClassName="h-[202px] w-[327px] xl:h-[304px] xl:w-[388px]"
              description="등록한 상품이 없어요"
            />
            <Link
              href="/products/new"
              className="rounded-lg bg-accent px-6 py-3 text-lg leading-[26px] font-semibold text-surface"
            >
              상품 등록하러 가기
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
