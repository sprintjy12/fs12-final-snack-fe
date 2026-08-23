"use client";

import { useEffect } from "react";

import { Button, EmptyState } from "@/components/ui";

type ErrorPageProps = {
  error: Error & { digest?: string };
  /** Next.js 16.2 — 세그먼트 자식 재렌더로 복구 */
  reset: () => void;
};

/**
 * 라우트 세그먼트 unexpected error boundary.
 * 권한 부족(Forbidden) · 프로필 로드 실패(RouteGuard)는 expected path라 여기로 보내지 않습니다.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100svh-54px)] w-full flex-col items-center justify-center gap-6 bg-surface-muted px-6 md:min-h-[calc(100svh-64px)] xl:min-h-[calc(100svh-88px)]">
      <EmptyState
        aria-label="오류가 발생했습니다"
        image="empty-purchase"
        title="문제가 발생했어요"
        description="잠시 후 다시 시도해 주세요."
      />
      <Button type="button" variant="outline" size="compact" onClick={reset}>
        다시 시도
      </Button>
    </main>
  );
}
