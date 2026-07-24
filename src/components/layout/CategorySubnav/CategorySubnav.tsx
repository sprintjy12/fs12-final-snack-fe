"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { CATEGORY_MENU_ORDERED } from "@/constants/categoryConstants";

import styles from "./CategorySubnav.module.css";

function buildProductsHref(categoryId?: number, subCategoryId?: number) {
  const params = new URLSearchParams();
  if (categoryId !== undefined) {
    params.set("categoryId", String(categoryId));
  }
  if (subCategoryId !== undefined) {
    params.set("subCategoryId", String(subCategoryId));
  }
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

/**
 * Figma: 상품 리스트 하위 메뉴 (대분류 + 소분류 탭)
 * Tab/menu_01/md — height 64, padding 0 120, gap 12, bg #FBF8F4
 */
export function CategorySubnav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isProductList =
    pathname === "/products" || pathname === "/products/";

  if (!isProductList) {
    return null;
  }

  const categoryIdParam = searchParams.get("categoryId");
  const subCategoryIdParam = searchParams.get("subCategoryId");
  const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
  const subCategoryId = subCategoryIdParam
    ? Number(subCategoryIdParam)
    : undefined;

  const activeCategory = CATEGORY_MENU_ORDERED.find(
    (category) => category.id === categoryId,
  );
  const subCategories = activeCategory?.subCategories ?? [];

  return (
    <div className={styles.wrap}>
      <div className={styles.row} aria-label="상품 카테고리">
        {CATEGORY_MENU_ORDERED.map((category) => {
          const isActive = category.id === categoryId;
          return (
            <Link
              key={category.id}
              href={buildProductsHref(category.id)}
              className={[styles.tab, isActive ? styles.tabActive : null]
                .filter(Boolean)
                .join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              {category.name}
            </Link>
          );
        })}
      </div>

      {subCategories.length > 0 ? (
        <div className={styles.row} aria-label="상품 소분류">
          {subCategories.map((sub) => {
            const isActive = sub.id === subCategoryId;
            return (
              <Link
                key={`${sub.categoryId}-${sub.id}`}
                href={buildProductsHref(categoryId, sub.id)}
                className={[styles.tab, isActive ? styles.tabActive : null]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                {sub.name}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
