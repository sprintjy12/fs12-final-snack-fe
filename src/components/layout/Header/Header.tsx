"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CATEGORY_MENU_ORDERED } from "@/constants/categoryConstants";

import styles from "./Header.module.css";

export type HeaderNavItem = {
  href: string;
  label: string;
};

export type HeaderProps = {
  brandHref?: string;
  brandLabel?: string;
  navItems?: HeaderNavItem[];
  cartHref?: string;
  profileHref?: string;
  cartCount?: number;
  onLogout?: () => void;
  className?: string;
};

const MUTED_NAV_HREFS = new Set(["/purchase/requests", "/products/mine"]);

/** Figma 일반 유저 상단바 */
const DEFAULT_NAV_ITEMS: HeaderNavItem[] = [
  { href: "/products", label: "상품 리스트" },
  { href: "/purchase/requests", label: "구매 요청 내역" },
  { href: "/products/mine", label: "상품 등록 내역" },
];

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

export function Header({
  brandHref = "/",
  brandLabel = "Snack",
  navItems = DEFAULT_NAV_ITEMS,
  cartHref = "/cart",
  profileHref = "/profile",
  cartCount,
  onLogout,
  className,
}: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  /** 상품 리스트 클릭 후에만 카테고리 바 표시 */
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const headerClassName = [styles.header, className].filter(Boolean).join(" ");
  const showCartBadge = typeof cartCount === "number" && cartCount > 0;
  const isProductList =
    pathname === "/products" || pathname === "/products/";
  /** 리스트·상세 모두 상품 영역 (시안: 상세에도 카테고리 바) */
  const isProductArea =
    isProductList || /^\/products\/\d+/.test(pathname);

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
  const showCategoryBar = isProductArea && categoryMenuOpen;

  useEffect(() => {
    if (!isProductArea) {
      setCategoryMenuOpen(false);
      return;
    }
    // 카드 → 상세(쿼리 포함) 진입 시에도 카테고리 바 유지
    if (categoryId !== undefined) {
      setCategoryMenuOpen(true);
    }
  }, [isProductArea, categoryId]);

  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (href: string) => {
    if (href === "/products") {
      setCategoryMenuOpen(true);
    } else {
      setCategoryMenuOpen(false);
    }
    closeMenu();
  };

  return (
    <header className={headerClassName}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.menuIcon} aria-hidden="true" />
          </button>

          <Link
            href={brandHref}
            className={styles.brand}
            aria-label={brandLabel}
            onClick={() => {
              setCategoryMenuOpen(false);
              closeMenu();
            }}
          >
            <Image
              src="/images/logo-snack.png"
              alt={brandLabel}
              className={styles.brandLogo}
              width={126}
              height={32}
              priority
            />
          </Link>
        </div>

        <nav className={styles.navDesktop} aria-label="주요 메뉴">
          <ul className={styles.navList}>
            {navItems.map((item) => {
              const isActive =
                item.href === "/products"
                  ? isProductArea
                  : pathname.startsWith(item.href);
              const isMuted = MUTED_NAV_HREFS.has(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      styles.navLink,
                      isMuted ? styles.navLinkMuted : null,
                      isActive ? styles.navLinkActive : null,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleNavClick(item.href)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.utils}>
          <Link
            href={cartHref}
            className={styles.utilLink}
            onClick={() => setCategoryMenuOpen(false)}
          >
            <span className={styles.utilLabel}>Cart</span>
            {showCartBadge ? (
              <span className={styles.badge} aria-label={`${cartCount}개`}>
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link
            href={profileHref}
            className={styles.utilLink}
            onClick={() => setCategoryMenuOpen(false)}
          >
            <span className={styles.utilLabel}>Profile</span>
            <span className={styles.avatar} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {showCategoryBar ? (
        <div className={styles.categoryWrap}>
          <div className={styles.categoryRow} aria-label="상품 카테고리">
            {CATEGORY_MENU_ORDERED.map((category) => {
              const isActive = category.id === categoryId;
              return (
                <Link
                  key={category.id}
                  href={buildProductsHref(category.id)}
                  className={[
                    styles.categoryTab,
                    isActive ? styles.categoryTabActive : null,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>

          {subCategories.length > 0 ? (
            <div className={styles.categoryRow} aria-label="상품 소분류">
              {subCategories.map((sub) => {
                const isActive = sub.id === subCategoryId;
                return (
                  <Link
                    key={`${sub.categoryId}-${sub.id}`}
                    href={buildProductsHref(categoryId, sub.id)}
                    className={[
                      styles.categoryTab,
                      isActive ? styles.categoryTabActive : null,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {sub.name}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {menuOpen ? (
        <nav className={styles.navMobile} aria-label="모바일 메뉴">
          <ul className={styles.mobileList}>
            {navItems.map((item) => {
              const isMuted = MUTED_NAV_HREFS.has(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      styles.mobileLink,
                      isMuted ? styles.navLinkMuted : null,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleNavClick(item.href)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
