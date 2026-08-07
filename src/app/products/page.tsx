"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { SORT_OPTIONS } from "@/constants/categoryConstants";
import {
  ProductCard,
  ProductsEmpty,
  ProductsSkeleton,
} from "@/features/products";
import { useProducts } from "@/hooks/queries/useProducts";
import { parseRouteId } from "@/lib/parseOptionalId";
import type { ProductListParams } from "@/types/productTypes";

import styles from "./products.module.css";

/** 시안: 4열 × 2행 */
const PAGE_SIZE = 8;

export default function ProductListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<ProductListParams["sort"]>("latest");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const categoryId = parseRouteId(searchParams.get("categoryId"));
  const subCategoryId = parseRouteId(searchParams.get("subCategoryId"));

  const listParams: ProductListParams = useMemo(
    () => ({ sort, categoryId, subCategoryId }),
    [sort, categoryId, subCategoryId],
  );

  const { data: products = [], isLoading, isError } = useProducts(listParams);

  const visibleProducts = useMemo(
    () => products.slice(0, page * PAGE_SIZE),
    [products, page],
  );
  const hasMore = visibleProducts.length < products.length;

  const selectedSortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "최신순";

  useEffect(() => {
    setPage(1);
  }, [sort, categoryId, subCategoryId]);

  useEffect(() => {
    if (!sortOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sortOpen]);

  const resetFilters = () => {
    setSort("latest");
    setPage(1);
    router.push("/products");
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    // 목 API 지연 느낌
    window.setTimeout(() => {
      setPage((current) => current + 1);
      setIsLoadingMore(false);
    }, 250);
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
      <div className={styles.toolbar}>
        <div className={styles.sort} ref={sortRef}>
          <button
            type="button"
            className={styles.sortTrigger}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            onClick={() => setSortOpen((open) => !open)}
          >
            <span>{selectedSortLabel}</span>
            <span className={styles.sortCaret} aria-hidden="true" />
          </button>
          {sortOpen ? (
            <ul className={styles.sortMenu} role="listbox" aria-label="정렬">
              {SORT_OPTIONS.map((option) => {
                const selected = sort === option.value;
                return (
                  <li key={option.value} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      className={[
                        styles.sortOption,
                        selected ? styles.sortOptionActive : null,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => {
                        setSort(option.value);
                        setSortOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <ProductsSkeleton />
      ) : isError ? (
        <ProductsEmpty
          title="상품을 불러오지 못했습니다"
          description="잠시 후 다시 시도해 주세요."
        />
      ) : products.length === 0 ? (
        <ProductsEmpty onReset={resetFilters} />
      ) : (
        <>
          <div className={styles.grid}>
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasMore ? (
            <div className={styles.loadMoreWrap}>
              <button
                type="button"
                className={styles.loadMore}
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                aria-busy={isLoadingMore}
              >
                <span>{isLoadingMore ? "불러오는 중…" : "더보기"}</span>
                {!isLoadingMore ? (
                  <span className={styles.loadMoreCaret} aria-hidden="true" />
                ) : null}
              </button>
            </div>
          ) : null}
        </>
      )}

      <button
        type="button"
        className={styles.fab}
        onClick={() => router.push("/products/new")}
      >
        <span className={styles.fabIcon} aria-hidden="true">
          +
        </span>
        <span>상품 등록</span>
      </button>
      </div>
    </div>
  );
}
