import Image from "next/image";

import { EmptyState, Icon, Pagination } from "@/components/ui";

const purchaseRequests = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  requestedAt: "2024. 07. 04",
  productName: "코카콜라 제로 외 1건",
  quantity: 4,
  amount: "21,000",
  requester: "김스낵",
}));

const paginationItems = ["1", "2", "3", "4", "5", "more", "9"] as const;

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
      <section className="border-b border-border px-6 xl:border-0 xl:px-[120px]">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center xl:h-36">
          <h1 className="text-xl leading-8 font-semibold text-foreground-strong md:ml-2.5 xl:text-[32px] xl:leading-[42px]">
            구매 요청 관리
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1680px]">
        <section className="flex h-16 items-center justify-end border-b-2 border-border px-6 xl:h-[66px] xl:border-0 xl:px-0">
          <label className="relative block">
            <span className="sr-only">구매 요청 정렬</span>
            <select className="h-9 w-[87px] appearance-none rounded-lg border border-snack-gray-200 bg-surface py-1.5 pr-7 pl-2 text-sm leading-6 font-normal text-foreground-muted outline-none focus:border-accent xl:h-[50px] xl:w-[136px] xl:px-3.5 xl:pr-10 xl:text-lg xl:leading-[26px]">
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

        <section
          aria-label="구매 요청 목록"
          className={hasPurchaseRequests ? undefined : "hidden"}
        >
          <div className="hidden xl:block">
            <div className="grid h-20 grid-cols-[207px_1fr_219px_219px_219px] items-center rounded-full border border-snack-gray-200 bg-surface px-20 text-center text-xl leading-8 font-medium text-snack-black-100">
              <span>구매요청일</span>
              <span>상품정보</span>
              <span>주문 금액</span>
              <span>요청인</span>
              <span>비고</span>
            </div>

            <ul className="mt-4">
              {visiblePurchaseRequests.map((request) => (
                <li
                  key={request.id}
                  className="grid h-[104px] grid-cols-[207px_1fr_219px_219px_219px] items-center border-b border-border px-20 text-center text-xl leading-8 text-snack-black-100"
                >
                  <span>{request.requestedAt}</span>
                  <div className="text-left">
                    <p className="font-semibold text-snack-black-200">
                      {request.productName}
                    </p>
                    <p className="text-sm leading-6 font-medium text-foreground-muted">
                      총 수량: {request.quantity}개
                    </p>
                  </div>
                  <span>{request.amount}</span>
                  <span>{request.requester}</span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      className="h-11 w-[94px] rounded-lg bg-snack-background-300 text-lg leading-[26px] font-semibold text-foreground-muted"
                    >
                      반려
                    </button>
                    <button
                      type="button"
                      className="h-11 w-[94px] rounded-lg bg-accent text-lg leading-[26px] font-semibold text-surface"
                    >
                      승인
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <ul className="xl:hidden">
            {visiblePurchaseRequests.slice(0, 3).map((request) => (
              <li
                key={request.id}
                className="h-[280px] border-b-2 border-border px-6 pt-6 pb-6"
              >
                <div className="flex h-[100px] gap-4">
                  <div className="flex size-[100px] shrink-0 items-center justify-center rounded-lg border border-border bg-surface shadow-[4px_4px_10px_rgba(250,247,243,0.25)]">
                    <Image
                      src="/images/purchase-history-product.png"
                      alt=""
                      width={28}
                      height={49}
                      className="h-[49px] w-7 object-contain"
                    />
                  </div>
                  <div className="flex w-[211px] min-w-0 flex-none flex-col justify-between">
                    <div>
                      <p className="text-sm leading-6 text-foreground-strong">
                        {request.productName}
                      </p>
                      <p className="text-xs leading-[18px] text-foreground-muted">
                        총 수량: {request.quantity}개
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="h-[34px] flex-1 rounded-lg bg-snack-background-300 text-[13px] leading-[22px] font-semibold text-foreground-muted"
                      >
                        반려
                      </button>
                      <button
                        type="button"
                        className="h-[34px] flex-1 rounded-lg bg-accent text-[13px] leading-[22px] font-semibold text-surface"
                      >
                        승인
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-b border-snack-gray-200 py-3 text-sm leading-6 font-semibold text-foreground-strong">
                  <span>주문금액</span>
                  <span>{request.amount}원</span>
                </div>

                <dl className="mt-3 space-y-2 text-sm leading-6 text-foreground-muted">
                  <div className="flex items-center justify-between">
                    <dt>구매요청일</dt>
                    <dd className="font-medium">{request.requestedAt}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>요청인</dt>
                    <dd className="font-medium">{request.requester}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </section>

        {!hasPurchaseRequests ? (
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
        ) : null}

        <Pagination
          aria-label="구매 요청 페이지"
          items={paginationItems}
          previousDisabled
          collapseMiddlePages
          className={[
            "mt-4 py-2 md:mt-8 md:py-0 xl:mt-[298px]",
            hasPurchaseRequests ? "flex" : "hidden",
          ].join(" ")}
        />
      </div>
    </main>
  );
};

export default PurchaseRequestsPage;
