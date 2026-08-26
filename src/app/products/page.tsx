"use client";

export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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

  // ── Search ──────────────────────────────────────────
  const searchParam = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(searchParam);
  const [activeSearch, setActiveSearch] = useState(searchParam);

  useEffect(() => {
    setSearchInput(searchParam);
    setActiveSearch(searchParam);
  }, [searchParam]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
    },
    [],
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const query = searchInput.trim();
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      const queryString = params.toString();
      setActiveSearch(query);
      setPage(1);
      setAccumulated([]);
      router.push(queryString ? `/products?${queryString}` : "/products");
    },
    [searchInput, searchParams, router],
  );

  const handleSearchClear = useCallback(() => {
    setSearchInput("");
    setActiveSearch("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("search");
    const queryString = params.toString();
    setPage(1);
    setAccumulated([]);
    router.push(queryString ? `/products?${queryString}` : "/products");
  }, [searchParams, router]);

  const categoryId = parseRouteId(searchParams.get("categoryId"));
  const subCategoryId = parseRouteId(searchParams.get("subCategoryId"));

  const listParams: ProductListParams = useMemo(
    () => ({
      sort,
      categoryId,
      subCategoryId,
      page,
      pageSize: PAGE_SIZE,
      ...(activeSearch ? { search: activeSearch } : {}),
    }),
    [sort, categoryId, subCategoryId, page, activeSearch],
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
  }, [sort, categoryId, subCategoryId, activeSearch]);

  // 새 페이지 데이터가 오면 누적
  useEffect(() => {
    if (isLoading) return;
    if (page === 1) {
      setAccumulated(pageProducts);
    } else {
      setAccumulated((prev) => [...prev, ...pageProducts]);
    }
  }, [pageProducts, page, isLoading]);

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
    setSearchInput("");
    router.push("/products");
  };

  const handleLoadMore = () => {
    if (!hasMore || isFetching) return;
    setPage((current) => current + 1);
  };

  const handleProductCreated = (product: Product) => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.products.all,
      refetchType: "none",
    });
    setPage(1);
    setAccumulated([]);
    showToast("상품을 등록했어요.");
    router.push(`/products/${product.id}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.toolbar}>
          {/* ── Search bar ── */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center w-full max-w-80 max-md:max-w-full max-md:-order-1"
          >
            <button
              type="submit"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-snack-gray-500 hover:text-snack-orange-500 transition-colors flex items-center justify-center cursor-pointer p-0 border-none bg-transparent"
              aria-label="검색"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <input
              id="product-search"
              type="text"
              className="w-full h-[42px] pl-10 pr-9 border border-snack-line-200 rounded-xl bg-snack-gray-50 text-snack-black-300 text-sm font-normal outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-snack-gray-500 focus:border-snack-orange-400 focus:shadow-[0_0_0_3px_rgba(249,123,34,0.12)]"
              placeholder="상품 검색"
              value={searchInput}
              onChange={handleSearchChange}
              maxLength={20}
              autoComplete="off"
            />
            {searchInput ? (
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-[22px] h-[22px] p-0 border-none rounded-full bg-snack-line-200 text-snack-gray-500 text-xs leading-none cursor-pointer transition-colors duration-150 hover:bg-snack-gray-500 hover:text-snack-gray-50"
                onClick={handleSearchClear}
                aria-label="검색어 지우기"
              >
                ✕
              </button>
            ) : null}
          </form>

          {/* ── Sort dropdown ── */}
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
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={selected}
                    >
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

        {isLoading || (isFetching && page === 1 && accumulated.length === 0) ? (
          <ProductsSkeleton />
        ) : isError ? (
          <ProductsEmpty
            title="상품을 불러오지 못했습니다"
            description="잠시 후 다시 시도해 주세요."
          />
        ) : accumulated.length === 0 && !isFetching ? (
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
          <span className={styles.fabIcon} aria-hidden="true">
            +
          </span>
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
