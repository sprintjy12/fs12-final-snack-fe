import { PurchaseRequestHistory } from "./PurchaseRequestHistory";

const purchaseRequestHistory = [
  {
    id: 1,
    requestedAt: "2024. 07. 04",
    productName: "코카콜라 제로 외 1건",
    quantity: 4,
    amount: "21,000",
    status: "pending" as const,
  },
  {
    id: 2,
    requestedAt: "2024. 07. 02",
    productName: "스프라이트 외 3건",
    quantity: 4,
    amount: "36,000",
    status: "pending" as const,
  },
  {
    id: 3,
    requestedAt: "2024. 07. 01",
    productName: "비요뜨 외 9건",
    quantity: 4,
    amount: "45,000",
    status: "rejected" as const,
  },
  {
    id: 4,
    requestedAt: "2024. 06. 30",
    productName: "환타 외 7건",
    quantity: 4,
    amount: "27,000",
    status: "approved" as const,
  },
  {
    id: 5,
    requestedAt: "2024. 06. 27",
    productName: "컵누들 외 5건",
    quantity: 4,
    amount: "40,000",
    status: "approved" as const,
  },
  {
    id: 6,
    requestedAt: "2024. 06. 20",
    productName: "코카콜라 외 2건",
    quantity: 4,
    amount: "17,000",
    status: "approved" as const,
  },
] as const;

type PurchaseMyRequestsPageProps = {
  searchParams: Promise<{
    empty?: string;
  }>;
};

export default async function PurchaseMyRequestsPage({
  searchParams,
}: PurchaseMyRequestsPageProps) {
  const { empty } = await searchParams;
  const visibleHistory = empty === "true" ? [] : purchaseRequestHistory;

  return (
    <main className="min-h-screen bg-surface-muted pb-20 text-foreground">
      <div className="mx-auto max-w-[1680px]">
        <PurchaseRequestHistory items={visibleHistory} />
      </div>
    </main>
  );
}
