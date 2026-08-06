import { EmptyState, Icon } from "@/components/ui";

import { PurchaseRequestsList } from "./PurchaseRequestsList";

const purchaseRequests = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  requestedAt: "2024. 07. 04",
  productName: "코카콜라 제로 외 1건",
  quantity: 4,
  amount: "21,000",
  requester: "김스낵",
}));

type PurchaseRequestsPageProps = {
  searchParams: Promise<{
    empty?: string;
  }>;
};

const PurchaseRequestsPage = async ({
  searchParams,
}: PurchaseRequestsPageProps) => {
  const { empty } = await searchParams;
  const visiblePurchaseRequests = empty === "true" ? [] : purchaseRequests;
  const hasPurchaseRequests = visiblePurchaseRequests.length > 0;

  return (
    <main className="min-h-screen bg-surface-muted pb-20 text-foreground">
      <section className="border-b border-solid border-border px-6 xl:border-0 xl:px-[120px]">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center xl:h-36">
          <h1 className="text-xl leading-8 font-semibold text-foreground-strong md:ml-2.5 xl:text-[32px] xl:leading-[42px]">
            구매 요청 관리
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1680px]">
        <section className="flex h-16 items-center justify-end border-b-2 border-solid border-border px-6 xl:h-[66px] xl:border-0 xl:px-0">
          <label className="relative block">
            <span className="sr-only">구매 요청 정렬</span>
            <select className="h-9 w-[87px] appearance-none rounded-lg border border-solid border-snack-gray-200 bg-surface py-1.5 pr-7 pl-2 text-sm leading-6 font-normal text-foreground-muted outline-none focus:border-accent xl:h-[50px] xl:w-[136px] xl:px-3.5 xl:pr-10 xl:text-lg xl:leading-[26px]">
              <option>최신순</option>
              <option>오래된순</option>
            </select>
            <Icon
              name="chevron-down"
              size="xs"
              className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-snack-gray-400 xl:right-3"
            />
          </label>
        </section>

        {hasPurchaseRequests ? (
          <PurchaseRequestsList requests={visiblePurchaseRequests} />
        ) : (
          <EmptyState
            aria-label="구매 요청 없음"
            image="empty-purchase"
            className="pt-16 md:pt-40 xl:pt-[179px]"
            contentClassName="h-[202px] w-[327px] xl:h-[304px] xl:w-[388px]"
            description={
              <>
                <span className="block">요청받은 내역이 없어요</span>
                <span className="block">
                  상품 리스트를 둘러보고 제품을 담아보세요!
                </span>
              </>
            }
          />
        )}
      </div>
    </main>
  );
};

export default PurchaseRequestsPage;
