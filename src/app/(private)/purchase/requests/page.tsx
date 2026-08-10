import Image from "next/image";

import { Icon } from "@/components/ui";

type RequestStatus = "pending" | "rejected" | "approved";

type PurchaseRequest = {
  id: number;
  requestedAt: string;
  productName: string;
  quantity: number;
  amount: string;
  requester: string;
  status: RequestStatus;
};

/** Figma Card/구매요청내역 lg (`1:9970`) 더미 */
const USER_PURCHASE_REQUESTS: PurchaseRequest[] = [
  {
    id: 1,
    requestedAt: "2024. 07. 04",
    productName: "코카콜라 제로 외 1건",
    quantity: 4,
    amount: "21,000",
    requester: "김스낵",
    status: "pending",
  },
  {
    id: 2,
    requestedAt: "2024. 07. 02",
    productName: "스프라이트 외 3건",
    quantity: 4,
    amount: "36,000",
    requester: "김스낵",
    status: "pending",
  },
  {
    id: 3,
    requestedAt: "2024. 07. 01",
    productName: "비요뜨 외 9건",
    quantity: 4,
    amount: "45,000",
    requester: "김스낵",
    status: "rejected",
  },
  {
    id: 4,
    requestedAt: "2024. 06. 30",
    productName: "환타 외 7건",
    quantity: 4,
    amount: "27,000",
    requester: "김스낵",
    status: "approved",
  },
  {
    id: 5,
    requestedAt: "2024. 06. 27",
    productName: "컵누들 외 5건",
    quantity: 4,
    amount: "40,000",
    requester: "김스낵",
    status: "approved",
  },
  {
    id: 6,
    requestedAt: "2024. 06. 20",
    productName: "코카콜라 외 2건",
    quantity: 4,
    amount: "17,000",
    requester: "김스낵",
    status: "approved",
  },
];

const ADMIN_PURCHASE_REQUESTS: PurchaseRequest[] = Array.from(
  { length: 6 },
  (_, index) => ({
    id: index + 1,
    requestedAt: "2024. 07. 04",
    productName: "코카콜라 제로 외 1건",
    quantity: 4,
    amount: "21,000",
    requester: "김스낵",
    status: "pending",
  }),
);

const paginationItems = ["1", "2", "3", "4", "5", "more", "9"] as const;

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "승인 대기",
  rejected: "구매 반려",
  approved: "승인 완료",
};

type PurchaseRequestsPageProps = {
  searchParams: Promise<{
    empty?: string;
    view?: string;
  }>;
};

const getStatusClassName = (status: RequestStatus) => {
  if (status === "pending") {
    return "text-snack-black-100";
  }
  return "text-snack-gray-300";
};

const PurchaseRequestsPage = async ({
  searchParams,
}: PurchaseRequestsPageProps) => {
  const { empty, view } = await searchParams;
  /** 유저 네비·완료 CTA: view=history → 구매요청내역. 기본 → 관리(팀) */
  const isHistoryView = view === "history";
  const source = isHistoryView
    ? USER_PURCHASE_REQUESTS
    : ADMIN_PURCHASE_REQUESTS;
  const visiblePurchaseRequests = empty === "true" ? [] : source;
  const hasPurchaseRequests = visiblePurchaseRequests.length > 0;
  const pageTitle = isHistoryView ? "구매 요청 내역" : "구매 요청 관리";
  const emptyTitle = isHistoryView
    ? "요청한 내역이 없어요"
    : "요청받은 내역이 없어요";

  return (
    <main className="min-h-screen bg-surface-muted pb-20 text-foreground">
      <section className="border-b border-border px-6 xl:border-0 xl:px-[120px]">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center xl:h-36">
          <h1 className="text-xl leading-8 font-semibold text-foreground-strong md:ml-2.5 xl:text-[32px] xl:leading-[42px]">
            {pageTitle}
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
          {/* Desktop — Figma Card/구매요청내역 lg */}
          <div className="hidden xl:block">
            <div
              className={[
                "grid h-20 items-center rounded-full border border-snack-gray-200 bg-surface px-20 text-center text-xl leading-8 font-medium text-snack-black-100",
                isHistoryView
                  ? "grid-cols-[167px_390px_195px_195px_195px] justify-between gap-10"
                  : "grid-cols-[207px_1fr_219px_219px_219px]",
              ].join(" ")}
            >
              <span>구매요청일</span>
              <span>상품정보</span>
              <span>주문 금액</span>
              <span>{isHistoryView ? "상태" : "요청인"}</span>
              <span>비고</span>
            </div>

            <ul className="mt-4">
              {visiblePurchaseRequests.map((request) => {
                const canCancel =
                  isHistoryView && request.status === "pending";

                return (
                  <li
                    key={request.id}
                    className={[
                      "grid items-center border-b border-border px-20 text-center text-xl leading-8",
                      isHistoryView
                        ? "grid-cols-[167px_390px_195px_195px_195px] justify-between gap-10 bg-surface-muted py-3"
                        : "h-[104px] grid-cols-[207px_1fr_219px_219px_219px] text-snack-black-100",
                    ].join(" ")}
                  >
                    <span
                      className={
                        isHistoryView
                          ? "pl-6 text-left text-snack-black-100"
                          : undefined
                      }
                    >
                      {request.requestedAt}
                    </span>
                    <div
                      className={
                        isHistoryView ? "pl-12 text-left" : "text-left"
                      }
                    >
                      <p className="font-semibold text-snack-black-200">
                        {request.productName}
                      </p>
                      <p className="text-sm leading-6 font-medium text-foreground-muted">
                        총 수량: {request.quantity}개
                      </p>
                    </div>
                    <span className="text-snack-black-100">
                      {request.amount}
                    </span>

                    {isHistoryView ? (
                      <span className={getStatusClassName(request.status)}>
                        {STATUS_LABEL[request.status]}
                      </span>
                    ) : (
                      <span>{request.requester}</span>
                    )}

                    <div className="flex items-center justify-center gap-2">
                      {isHistoryView ? (
                        canCancel ? (
                          <button
                            type="button"
                            className="rounded-lg border border-accent bg-surface-muted px-4 py-2 text-lg leading-[26px] font-semibold text-accent"
                          >
                            요청 취소
                          </button>
                        ) : null
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <ul className="xl:hidden">
            {visiblePurchaseRequests.slice(0, 3).map((request) => {
              const canCancel =
                isHistoryView && request.status === "pending";

              return (
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
                      {isHistoryView ? (
                        canCancel ? (
                          <button
                            type="button"
                            className="h-[34px] rounded-lg border border-accent bg-surface-muted text-[13px] leading-[22px] font-semibold text-accent"
                          >
                            요청 취소
                          </button>
                        ) : (
                          <p
                            className={[
                              "text-[13px] leading-[22px] font-medium",
                              getStatusClassName(request.status),
                            ].join(" ")}
                          >
                            {STATUS_LABEL[request.status]}
                          </p>
                        )
                      ) : (
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
                      )}
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
                    {isHistoryView ? (
                      <div className="flex items-center justify-between">
                        <dt>상태</dt>
                        <dd
                          className={[
                            "font-medium",
                            getStatusClassName(request.status),
                          ].join(" ")}
                        >
                          {STATUS_LABEL[request.status]}
                        </dd>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <dt>요청인</dt>
                        <dd className="font-medium">{request.requester}</dd>
                      </div>
                    )}
                  </dl>
                </li>
              );
            })}
          </ul>
        </section>

        {!hasPurchaseRequests ? (
          <section
            aria-label="구매 요청 없음"
            className="flex justify-center pt-16 md:pt-40 xl:pt-[179px]"
          >
            <div className="flex h-[202px] w-[327px] flex-col items-center gap-6 xl:h-[304px] xl:w-[388px] xl:gap-10">
              <div className="flex h-[130px] w-[180px] items-center justify-center xl:h-[200px] xl:w-[280px]">
                <picture>
                  <source
                    media="(min-width: 1280px)"
                    srcSet="/images/common/empty-purchase-md.svg"
                  />
                  <Image
                    src="/images/common/empty-purchase-sm.svg"
                    alt=""
                    width={180}
                    height={130}
                    className="block h-auto w-[180px] xl:w-[280px]"
                  />
                </picture>
              </div>
              <p className="text-center text-sm leading-6 font-medium whitespace-nowrap text-snack-gray-400 xl:text-xl xl:leading-8">
                <span className="block">{emptyTitle}</span>
                <span className="block">
                  상품 리스트를 둘러보고 제품을 담아보세요!
                </span>
              </p>
            </div>
          </section>
        ) : null}

        <nav
          aria-label="구매 요청 페이지"
          className={[
            "mt-4 items-center justify-center gap-2 py-2 md:mt-8 md:py-0 xl:mt-[298px] xl:gap-2.5",
            hasPurchaseRequests ? "flex" : "hidden",
          ].join(" ")}
        >
          <button
            type="button"
            aria-label="이전 페이지"
            disabled
            className="flex size-[34px] items-center justify-center rounded-md text-snack-gray-300 disabled:cursor-not-allowed xl:size-12 xl:rounded-lg"
          >
            <Icon name="chevron-left" size="sm" />
          </button>

          <div className="flex items-center gap-1">
            {paginationItems.map((page) =>
              page === "more" ? (
                <span
                  key={page}
                  aria-hidden="true"
                  className="flex size-[34px] items-center justify-center text-snack-gray-300 xl:size-12"
                >
                  ···
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  aria-current={page === "1" ? "page" : undefined}
                  className={[
                    "flex size-[34px] items-center justify-center rounded-md text-base leading-[26px] xl:size-12 xl:rounded-lg xl:text-lg",
                    page === "1"
                      ? "font-semibold text-foreground-strong"
                      : "font-medium text-snack-gray-300 xl:font-normal",
                    page === "4" || page === "5" ? "hidden xl:flex" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {page}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            aria-label="다음 페이지"
            className="flex size-[34px] items-center justify-center rounded-md text-foreground-strong xl:size-12 xl:rounded-lg"
          >
            <Icon name="chevron-right" size="sm" />
          </button>
        </nav>
      </div>
    </main>
  );
};

export default PurchaseRequestsPage;
