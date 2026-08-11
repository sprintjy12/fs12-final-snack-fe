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
  const { data: profile, isPending } = useMyProfile();
  const { data: cart } = useCart();
  const onLogout = useClientLogout();

  // 권한 확인 전에는 보호 메뉴를 렌더하지 않음 (이전 세션 메뉴 flash 방지)
  const roleReady = hasToken && !isPending && Boolean(profile?.role);
  const navItems = roleReady ? getNavItemsForRole(profile?.role) : [];
  const cartCount = roleReady ? (cart?.summary?.totalQuantity ?? 0) : 0;

  return (
    <Header
      cartCount={cartCount}
      navItems={navItems}
      onLogout={roleReady ? onLogout : undefined}
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
