import type { Metadata } from "next";
import type { ReactNode } from "react";

/** 로그인 후 영역 — 검색 노출 대상이 아닙니다. */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return children;
}
