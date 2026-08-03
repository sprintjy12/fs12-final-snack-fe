import type { Metadata } from "next";
import type { ReactNode } from "react";

/** 학습/데모용 샘플 — 검색 노출 대상이 아닙니다. */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ModalSampleLayout({ children }: { children: ReactNode }) {
  return children;
}
