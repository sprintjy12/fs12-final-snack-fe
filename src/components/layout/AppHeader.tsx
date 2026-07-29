"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { Header } from "@/components/layout";

/** 표지(`/`), 모달 샘플에서는 헤더를 숨깁니다. */
export function AppHeader() {
  const pathname = usePathname();
  const isModalSampleRoute = pathname === "/modal-sample";

  if (pathname === "/" || isModalSampleRoute) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <Header cartCount={2} />
    </Suspense>
  );
}
