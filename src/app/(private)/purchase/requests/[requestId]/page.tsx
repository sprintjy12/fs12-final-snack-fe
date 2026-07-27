type PurchaseRequestDetailPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

const PurchaseRequestDetailPage = async ({
  params,
}: PurchaseRequestDetailPageProps) => {
  const { requestId } = await params;

  return (
    <main className="min-h-screen bg-surface-muted px-6 py-10 text-foreground">
      <div className="mx-auto max-w-[1680px]">
        <h1 className="text-2xl font-semibold text-foreground-strong">
          구매요청 상세
        </h1>
        <p className="mt-4 text-foreground-muted">
          구매요청 번호: {requestId}
        </p>
      </div>
    </main>
  );
};

export default PurchaseRequestDetailPage;
