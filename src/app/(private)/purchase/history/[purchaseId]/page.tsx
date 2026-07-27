type PurchaseHistoryDetailPageProps = {
  params: Promise<{
    purchaseId: string;
  }>;
};

const PurchaseHistoryDetailPage = async ({
  params,
}: PurchaseHistoryDetailPageProps) => {
  const { purchaseId } = await params;

  return (
    <main className="min-h-screen bg-surface-muted px-6 py-10 text-foreground">
      <div className="mx-auto max-w-[1680px]">
        <h1 className="text-2xl font-semibold text-foreground-strong">
          구매내역 상세
        </h1>
        <p className="mt-4 text-foreground-muted">
          구매내역 번호: {purchaseId}
        </p>
      </div>
    </main>
  );
};

export default PurchaseHistoryDetailPage;
