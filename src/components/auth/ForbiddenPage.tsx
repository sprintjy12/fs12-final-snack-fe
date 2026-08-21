import { EmptyState } from "@/components/ui";

/**
 * 권한 부족(403) 안내.
 * GNB(AppHeader) 아래에 표시 — not-found의 fixed overlay 패턴을 쓰지 않습니다.
 */
export function ForbiddenPage() {
  return (
    <main className="flex min-h-[calc(100vh-88px)] w-full items-center justify-center bg-surface-muted px-6">
      <EmptyState
        aria-label="권한이 없습니다"
        image="empty-purchase"
        title="권한이 없습니다"
        description="이 페이지에 접근할 수 있는 권한이 없어요."
      />
    </main>
  );
}
