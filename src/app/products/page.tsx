"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { SORT_OPTIONS } from "@/constants/categoryConstants";
import { queryKeys } from "@/constants/queryKeys";
import {
  ProductCard,
  ProductRegisterModal,
  ProductsEmpty,
  ProductsSkeleton,
} from "@/features/products";
import { useProducts } from "@/hooks/queries/useProducts";
import { parseRouteId } from "@/lib/parseOptionalId";
import { showToast } from "@/components/ui";
import type { Product, ProductListParams } from "@/types/productTypes";

import styles from "./products.module.css";

const PAGE_SIZE = 8;

export default function ProductListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<ProductListParams["sort"]>("latest");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<Product[]>([]);
  const [registerOpen, setRegisterOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const categoryId = parseRouteId(searchParams.get("categoryId"));
  const subCategoryId = parseRouteId(searchParams.get("subCategoryId"));

  const listParams: ProductListParams = useMemo(
    () => ({
      sort,
      categoryId,
      subCategoryId,
      page,
      pageSize: PAGE_SIZE,
    }),
    [sort, categoryId, subCategoryId, page],
  );

  const {
    data: pageProducts = [],
    isLoading,
    isFetching,
    isError,
  } = useProducts(listParams);

  // 필터가 바뀌면 1페이지부터 다시
  useEffect(() => {
    setPage(1);
    setAccumulated([]);
  }, [sort, categoryId, subCategoryId]);

  // 새 페이지 데이터가 오면 누적
  useEffect(() => {
    if (isLoading) return;
    setAccumulated((prev) =>
      page === 1 ? pageProducts : [...prev, ...pageProducts],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageProducts, page]);

  // 이번 페이지가 꽉 찬 8개면 다음 페이지가 있을 수 있다고 추정
  const hasMore = pageProducts.length === PAGE_SIZE;

  const selectedSortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "최신순";

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
    router.push("/products");
  };

  const handleLoadMore = () => {
    if (!hasMore || isFetching) return;
    setPage((current) => current + 1);
  };

  const handleProductCreated = (product: Product) => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    setPage(1);
    setAccumulated([]);
    showToast("상품을 등록했어요.");
    router.push(`/products/${product.id}`);
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

        {isLoading && page === 1 ? (
          <ProductsSkeleton />
        ) : isError ? (
          <ProductsEmpty
            title="상품을 불러오지 못했습니다"
            description="잠시 후 다시 시도해 주세요."
          />
        ) : accumulated.length === 0 ? (
          <ProductsEmpty onReset={resetFilters} />
        ) : (
          <>
            <div className={styles.grid}>
              {accumulated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMore ? (
              <div className={styles.loadMoreWrap}>
                <button
                  type="button"
                  className={styles.loadMore}
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  aria-busy={isFetching}
                >
                  <span>{isFetching ? "불러오는 중…" : "더보기"}</span>
                  {!isFetching ? (
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
          onClick={() => setRegisterOpen(true)}
        >
          <span className={styles.fabIcon} aria-hidden="true">+</span>
          <span>상품 등록</span>
        </button>
      </div>

      <ProductRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onCreated={handleProductCreated}
      />
    </div>
  );
}