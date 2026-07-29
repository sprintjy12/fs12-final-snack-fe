"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { Header } from "@/components/layout";

/** 표지(`/`), purchase 페이지, 모달 샘플에서는 헤더를 숨깁니다. */
export function AppHeader() {
  const pathname = usePathname();
  const isPurchaseRoute =
    pathname === "/purchase" || pathname.startsWith("/purchase/");
  const isModalSampleRoute = pathname === "/modal-sample";

  if (pathname === "/" || isPurchaseRoute || isModalSampleRoute) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <Header cartCount={2} />
    </Suspense>
  );
}
