"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { Header } from "@/components/layout";
import {
  getNavItemsForRole,
  shouldHideAppHeader,
} from "@/constants/accessControl";
import { useCart } from "@/hooks/queries/useCart";
import { useMyProfile } from "@/hooks/queries/useMyProfile";
import { useClientLogout } from "@/hooks/useClientLogout";
import { getAccessToken } from "@/lib/authStorage";

function HeaderWithAuth() {
  const hasToken = Boolean(getAccessToken());
  const { data: profile, isPending, isFetching, isError } = useMyProfile();
  const { data: cart } = useCart();
  const onLogout = useClientLogout();

  // 프로필 미확정·조회 실패·초기 fetch 중에는 cached role 메뉴를 쓰지 않음
  // (RouteGuard error UI와 Header 권한 메뉴 불일치 방지)
  const roleReady =
    hasToken &&
    !isPending &&
    !isError &&
    !(isFetching && !profile?.role) &&
    Boolean(profile?.role);

  const navItems = roleReady ? getNavItemsForRole(profile?.role) : [];
  const cartCount = roleReady ? (cart?.summary?.totalQuantity ?? 0) : 0;

  return (
    <Header
      cartCount={cartCount}
      navItems={navItems}
      onLogout={hasToken ? onLogout : undefined}
    />
  );
}

/** 표지(`/`), 인증·샘플 페이지에서는 헤더를 숨깁니다. */
export function AppHeader() {
  const pathname = usePathname();

  if (shouldHideAppHeader(pathname)) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <HeaderWithAuth />
    </Suspense>
  );
}
