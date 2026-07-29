"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Icon } from "@/components/ui";

export type HeaderNavItem = {
  href: string;
  label: string;
};

export type HeaderProps = {
  cartCount?: number;
  navItems?: readonly HeaderNavItem[];
  onLogout?: () => void;
};

const DEFAULT_NAV_ITEMS = [
  { href: "/products", label: "상품 리스트" },
  { href: "/purchase/requests?view=history", label: "구매 요청 내역" },
  { href: "/purchase/requests", label: "구매 요청 관리" },
  { href: "/purchase/history", label: "구매 내역 확인" },
  { href: "/products/mine", label: "상품 등록 내역" },
  { href: "/admin", label: "관리" },
] as const satisfies readonly HeaderNavItem[];

function isNavItemActive(
  href: string,
  pathname: string,
  view: string | null,
) {
  if (href === "/purchase/history") {
    return (
      pathname === "/purchase/history" ||
      pathname.startsWith("/purchase/history/")
    );
  }

  if (href === "/purchase/requests?view=history") {
    return pathname === "/purchase/requests" && view === "history";
  }

  if (href === "/purchase/requests") {
    if (pathname.startsWith("/purchase/requests/")) {
      return true;
    }

    return pathname === "/purchase/requests" && view !== "history";
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
  view: string | null,
) {
  const matchedItems = navItems.filter((navItem) =>
    isNavItemActive(navItem.href, pathname, view),
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
  cartCount = 2,
  navItems = DEFAULT_NAV_ITEMS,
  onLogout,
}: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const showCartBadge = cartCount > 0;
  const activeHref = getActiveNavHref(navItems, pathname, view);

  return (
    <header className="border-b border-border bg-surface-muted">
      <div className="mx-auto flex h-[54px] max-w-[1680px] items-center justify-between px-6 md:h-16 xl:h-[88px] xl:px-0">
        <div className="flex items-center gap-6 xl:gap-16">
          <button
            type="button"
            aria-label="메뉴 열기"
            className="flex size-6 items-center justify-center text-snack-gray-400 xl:hidden"
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

          <Link href="/profile" aria-label="프로필" className="xl:px-4">
            <Icon name="profile" size="sm" className="xl:hidden" />
            <span className="hidden text-xl leading-8 font-bold text-snack-gray-300 xl:inline">
              Profile
            </span>
          </Link>

          <button
            type="button"
            onClick={onLogout}
            className="hidden cursor-pointer bg-transparent text-xl leading-8 font-bold text-snack-gray-300 xl:block xl:px-4"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
