import { PurchaseRequestHistory } from "./PurchaseRequestHistory";

export default function PurchaseMyRequestsPage() {
  return (
    <main className="min-h-screen bg-surface-muted pb-20 text-foreground">
      <div className="mx-auto max-w-[1680px]">
        <PurchaseRequestHistory />
      </div>
    </main>
  );
}
