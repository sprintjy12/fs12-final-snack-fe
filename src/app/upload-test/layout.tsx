import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

/** 로컬 업로드 샘플 — 검색/프로덕션 노출 대상이 아닙니다. */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function UploadTestLayout({ children }: { children: ReactNode }) {
  // 배포 환경에서는 테스트 페이지 자체를 숨깁니다.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return children;
}
