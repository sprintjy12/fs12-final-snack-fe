"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Header } from "@/components/layout";
import {
  CART_CHANGE_EVENT,
  CART_STORAGE_KEY,
  getCartItemCount,
} from "@/lib/cartStorage";

function HeaderWithCartCount() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const syncCount = () => setCartCount(getCartItemCount());
    syncCount();

    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY || event.key === null) {
        syncCount();
      }
    };

    window.addEventListener(CART_CHANGE_EVENT, syncCount);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, syncCount);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return <Header cartCount={cartCount} />;
}

/** 표지(`/`)에서는 Figma 시안처럼 헤더를 숨깁니다. */
export function AppHeader() {
  const pathname = usePathname();
  const isPurchaseRoute =
    pathname === "/purchase" || pathname.startsWith("/purchase/");

  const isDocsRoute = pathname === "/docs" || pathname.startsWith("/docs/");

  if (pathname === "/" || isPurchaseRoute || isDocsRoute) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <HeaderWithCartCount />
    </Suspense>
  );
}
