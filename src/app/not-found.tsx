import { EmptyState } from "@/components/ui";

/**
 * 페이지를 찾을 수 없음(404).
 * fixed overlay로 GNB를 덮습니다 (Forbidden과 다른 패턴).
 */
export default function NotFoundPage() {
  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-surface-muted px-6">
      <EmptyState
        aria-label="페이지를 찾을 수 없어요"
        image="empty-purchase"
        title="페이지를 찾을 수 없어요"
        description="주소가 잘못되었거나 페이지가 이동되었을 수 있어요."
      />
    </main>
  );
}
