"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Icon } from "@/components/ui";
import {
  ALL_NAV_ITEMS,
  type AppNavItem,
} from "@/constants/accessControl";
import {
  CATEGORY_MENU_ORDERED,
  findCategoryMenuItem,
} from "@/constants/categoryConstants";
import { useCategories } from "@/hooks/queries/useProducts";
import { parseRouteId } from "@/lib/parseOptionalId";
import { isProductApiMock } from "@/api/productApi";

export type HeaderNavItem = AppNavItem;

export type HeaderProps = {
  cartCount?: number;
  navItems?: readonly HeaderNavItem[];
  onLogout?: () => void;
};

/** 정책 미주입 시 SUPER_ADMIN 전체 메뉴 (실제 노출은 AppHeader에서 role 필터) */
const DEFAULT_NAV_ITEMS = ALL_NAV_ITEMS;

function buildProductsHref(
  categoryId?: number | string,
  subCategoryId?: number | string,
) {
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

function isProductListPath(pathname: string) {
  return pathname === "/products" || pathname === "/products/";
}

/** 리스트·상세 — mock 숫자 id / BE uuid 모두 */
function isProductArea(pathname: string) {
  if (isProductListPath(pathname)) return true;
  if (
    pathname.startsWith("/products/mine") ||
    pathname.startsWith("/products/new")
  ) {
    return false;
  }
  return /^\/products\/[^/]+/.test(pathname);
}

function categoryRouteId(
  category: { id: number | string; apiId: string },
  useApiIds: boolean,
) {
  return useApiIds ? category.apiId : category.id;
}

function isNavItemActive(href: string, pathname: string) {
  if (href === "/products") {
    return isProductArea(pathname);
  }

  if (href === "/purchase/history") {
    return (
      pathname === "/purchase/history" ||
      pathname.startsWith("/purchase/history/")
    );
  }

  if (href === "/purchase/my-requests") {
    return (
      pathname === "/purchase/my-requests" ||
      pathname.startsWith("/purchase/my-requests/")
    );
  }

  if (href === "/purchase/requests") {
    return (
      pathname === "/purchase/requests" ||
      pathname.startsWith("/purchase/requests/")
    );
  }

  if (href === "/admin") {
    return (
      pathname === "/admin" ||
      pathname.startsWith("/admin/") ||
      pathname === "/budget" ||
      pathname.startsWith("/budget/")
    );
  }

  const [path] = href.split("?");
  return pathname === path || pathname.startsWith(`${path}/`);
}

function getActiveNavHref(
  navItems: readonly HeaderNavItem[],
  pathname: string,
) {
  const matchedItems = navItems.filter((navItem) =>
    isNavItemActive(navItem.href, pathname),
  );

  if (matchedItems.length === 0) {
    return null;
  }

  return matchedItems.reduce((longestItem, navItem) => {
    const longestPath = longestItem.href.split("?")[0] ?? longestItem.href;
    const currentPath = navItem.href.split("?")[0] ?? navItem.href;

    return currentPath.length > longestPath.length ? navItem : longestItem;
  }).href;
}

export function Header({
  cartCount = 0,
  navItems = DEFAULT_NAV_ITEMS,
  onLogout,
}: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showCartBadge = cartCount > 0;
  const activeHref = getActiveNavHref(navItems, pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categoryId = parseRouteId(searchParams.get("categoryId"));
  const subCategoryId = parseRouteId(searchParams.get("subCategoryId"));
  const showCategoryBar = isProductArea(pathname);
  const useApiIds = !isProductApiMock();
  const { data: categoryMenu = CATEGORY_MENU_ORDERED } = useCategories();

  const activeCategory = findCategoryMenuItem(categoryId);
  const subCategories = activeCategory?.subCategories ?? [];

  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-border bg-surface-muted">
        <div className="mx-auto flex h-[54px] w-full max-w-[1920px] items-center justify-between px-6 md:h-16 xl:h-[88px] xl:px-[120px]">
          <div className="flex items-center gap-6 xl:gap-16">
            <button
              type="button"
              aria-label="메뉴 열기"
              aria-expanded={sidebarOpen}
              aria-controls="mobile-sidebar"
              onClick={() => setSidebarOpen(true)}
              className="flex size-6 cursor-pointer items-center justify-center text-snack-gray-400 xl:hidden"
            >
              <Icon name="menu" size="sm" />
            </button>

            <Link href="/" aria-label="Snack 홈" className="shrink-0">
              <picture>
                <source
                  media="(min-width: 1280px)"
                  srcSet="/images/common/logo-text-md.svg"
                />
                <Image
                  src="/images/common/logo-text-sm.svg"
                  alt="Snack"
                  width={80}
                  height={54}
                  priority
                  className="block h-[54px] w-20 xl:h-[88px] xl:w-[126px]"
                />
              </picture>
            </Link>

            <nav className="hidden xl:block" aria-label="주요 메뉴">
              <ul className="flex items-center gap-10">
                {navItems.map((navigation) => {
                  const active = navigation.href === activeHref;

                  return (
                    <li key={`${navigation.href}-${navigation.label}`}>
                      <Link
                        href={navigation.href}
                        aria-current={active ? "page" : undefined}
                        className={[
                          "flex h-[88px] items-center whitespace-nowrap px-4 text-xl leading-8 font-bold",
                          active ? "text-accent" : "text-snack-gray-400",
                        ].join(" ")}
                      >
                        {navigation.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-4 xl:gap-12">
            <Link
              href="/cart"
              aria-label={
                showCartBadge
                  ? `장바구니, 상품 ${cartCount}개`
                  : "장바구니"
              }
              className="relative flex items-center text-snack-gray-400 xl:gap-2 xl:px-4"
            >
              <Icon
                name="cart"
                size="sm"
                variant="outlined"
                className="xl:hidden"
              />
              <span className="hidden text-xl leading-8 font-bold text-snack-gray-300 xl:inline">
                Cart
              </span>
              {showCartBadge ? (
                <span className="absolute -top-1.5 -right-1.5 flex min-w-3.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] leading-3.5 font-semibold text-surface xl:static xl:min-w-0 xl:px-3.5 xl:text-xl xl:leading-8 xl:font-bold">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            <Link
              href="/profile"
              aria-label="프로필"
              aria-current={pathname.startsWith("/profile") ? "page" : undefined}
              className="xl:px-4"
            >
              <Icon name="profile" size="sm" className="xl:hidden" />
              <span
                className={[
                  "hidden text-xl leading-8 font-bold xl:inline",
                  pathname.startsWith("/profile")
                    ? "text-accent"
                    : "text-snack-gray-300",
                ].join(" ")}
              >
                Profile
              </span>
            </Link>

            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                className="hidden cursor-pointer bg-transparent text-xl leading-8 font-bold text-snack-gray-300 xl:block xl:px-4"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>

        {showCategoryBar ? (
          <div className="border-t border-border bg-surface-muted">
            <div
              className="mx-auto flex h-[52px] max-w-[1920px] items-center gap-3 overflow-x-auto px-6 xl:h-16 xl:px-[120px]"
              aria-label="상품 카테고리"
            >
              {categoryMenu.map((category) => {
                const routeId = categoryRouteId(category, useApiIds);
                const isActive =
                  categoryId !== undefined &&
                  (category.id === categoryId ||
                    category.apiId === categoryId);

                return (
                  <Link
                    key={String(category.apiId)}
                    href={buildProductsHref(routeId)}
                    className={[
                      "flex h-full shrink-0 items-center whitespace-nowrap px-4 py-3.5 text-lg leading-[26px]",
                      isActive
                        ? "border-b-2 border-accent px-2.5 font-bold text-accent"
                        : "font-medium text-snack-gray-400",
                    ].join(" ")}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </div>

            {subCategories.length > 0 ? (
              <div
                className="mx-auto flex h-[52px] max-w-[1920px] items-center gap-3 overflow-x-auto border-t border-border px-6 xl:h-16 xl:px-[120px]"
                aria-label="상품 소분류"
              >
                {subCategories.map((sub) => {
                  const parentRouteId =
                    categoryId ??
                    (activeCategory
                      ? categoryRouteId(activeCategory, useApiIds)
                      : undefined);
                  const subRouteId = useApiIds ? sub.apiId : sub.id;
                  const isActive =
                    subCategoryId !== undefined &&
                    (sub.id === subCategoryId ||
                      sub.apiId === subCategoryId);

                  return (
                    <Link
                      key={`${sub.categoryId}-${sub.id}`}
                      href={buildProductsHref(parentRouteId, subRouteId)}
                      className={[
                        "flex h-full shrink-0 items-center whitespace-nowrap px-4 py-3.5 text-base leading-[26px]",
                        isActive
                          ? "px-2.5 font-semibold text-accent"
                          : "font-medium text-snack-gray-400",
                      ].join(" ")}
                    >
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      <MobileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={navItems}
        activeHref={activeHref}
        onLogout={onLogout}
      />
    </>
  );
}
