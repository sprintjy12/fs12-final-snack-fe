"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { Header } from "@/components/layout";

/** 표지(`/`)에서는 Figma 시안처럼 헤더를 숨깁니다. */
export function AppHeader() {
  const pathname = usePathname();
  const isPurchaseRoute =
    pathname === "/purchase" || pathname.startsWith("/purchase/");

  if (pathname === "/" || isPurchaseRoute) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <Header cartCount={2} />
    </Suspense>
  );
}
