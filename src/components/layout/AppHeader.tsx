"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { Header } from "@/components/layout";
import { useCart } from "@/hooks/queries/useCart";

function HeaderWithCartCount() {
  const { data: cart } = useCart();
  const cartCount = cart?.summary?.totalQuantity ?? 0;

  return <Header cartCount={cartCount} />;
}

/** 표지(`/`), 인증·샘플 페이지에서는 헤더를 숨깁니다. */
export function AppHeader() {
  const pathname = usePathname();
  const isSampleRoute =
    pathname === "/modal-sample" || pathname === "/toast-sample";
  const isAuthRoute =
    pathname.startsWith("/signup") || pathname.startsWith("/login");

  if (pathname === "/" || isSampleRoute || isAuthRoute) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <HeaderWithCartCount />
    </Suspense>
  );
}
