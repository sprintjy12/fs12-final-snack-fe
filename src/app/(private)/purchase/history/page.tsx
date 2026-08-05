"use client";

import Image from "next/image";
import { useMemo, useState, type ChangeEvent } from "react";

import {
  EmptyState,
  Icon,
  Pagination,
  type PaginationItem,
} from "@/components/ui";
import { useBudgetSummary } from "@/hooks/queries/useBudgetSummary";
import { useOrders } from "@/hooks/queries/useOrders";
import type { BudgetSummaryData } from "@/types/budgetTypes";
import type { OrderListItem, OrderListSort } from "@/types/orderTypes";

const PAGE_SIZE = 10;

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}`;
};

const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}`;

const formatWon = (price: number) => `${formatPrice(price)}원`;

const buildSummaryCards = (summary: BudgetSummaryData | undefined) => {
  if (!summary) {
    return [
      {
        title: "이번 달 지출액",
        description: "불러오는 중…",
        amount: "-",
      },
      {
        title: "이번 달 남은 예산",
        description: "불러오는 중…",
        amount: "-",
      },
      {
        title: "올해 총 지출액",
        description: "불러오는 중…",
        amount: "-",
      },
    ] as const;
  }

  const remainingDiff = summary.remainingDiffFromPreviousMonth;
  const remainingDiffText =
    remainingDiff >= 0
      ? `지난 달보다 ${formatWon(remainingDiff)} 더 많아요`
      : `지난 달보다 ${formatWon(Math.abs(remainingDiff))} 더 적어요`;

  const spentDiff = summary.spentDiffFromPreviousYear;
  const spentDiffText =
    spentDiff >= 0
      ? `지난 해보다 ${formatWon(spentDiff)} 더 지출했어요`
      : `지난 해보다 ${formatWon(Math.abs(spentDiff))} 덜 지출했어요`;

  return [
    {
      title: "이번 달 지출액",
      description: `지난 달: ${formatWon(summary.previousMonth.spent)}`,
      amount: formatWon(summary.currentMonth.spent),
    },
    {
      title: "이번 달 남은 예산",
      description: remainingDiffText,
      amount: formatWon(summary.currentMonth.remaining),
    },
    {
      title: "올해 총 지출액",
      description: spentDiffText,
      amount: formatWon(summary.currentYear.spent),
    },
  ] as const;
};

const formatProductName = (order: OrderListItem) => {
  const { firstProductName, itemCount } = order;
  if (!firstProductName) {
    return "상품 정보 없음";
  }
  if (itemCount <= 1) {
    return firstProductName;
  }
  return `${firstProductName} 외 ${itemCount - 1}건`;
};

/** 시안용 페이지 번호 배열을 API totalPages 기준으로 만듭니다. */
const buildPaginationItems = (
  currentPage: number,
  totalPages: number,
): PaginationItem[] => {
  if (totalPages <= 0) {
    return ["1"];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => String(index + 1));
  }

  const items: PaginationItem[] = ["1", "2", "3", "4", "5", "more"];
  items.push(String(totalPages));
  return items;
};

export default function PurchaseHistoryPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<OrderListSort>("latest");

  const { data, isPending, isError, error } = useOrders({
    page,
    limit: PAGE_SIZE,
    sort,
  });
  const { data: budgetSummaryResponse } = useBudgetSummary();

  const summaryCards = useMemo(
    () => buildSummaryCards(budgetSummaryResponse?.data),
    [budgetSummaryResponse?.data],
  );

  const orders = data?.data ?? [];
  const pagination = data?.pagination;
  const hasPurchaseHistory = orders.length > 0;

  const paginationItems = useMemo(
    () =>
      buildPaginationItems(
        pagination?.currentPage ?? page,
        pagination?.totalPages ?? 0,
      ),
    [pagination?.currentPage, pagination?.totalPages, page],
  );

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextSort = event.target.value as OrderListSort;
    setSort(nextSort);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-surface-muted pb-20 text-foreground">
      <section className="border-b border-border px-6 xl:border-0 xl:px-[120px]">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center xl:h-36">
          <h1 className="text-xl leading-8 font-semibold text-foreground-strong md:ml-2.5 xl:text-[32px] xl:leading-[42px]">
            구매 내역 확인
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1680px]">
        <section
          aria-label="지출 요약"
          className="grid grid-cols-2 gap-x-[15px] gap-y-4 px-6 pt-7 md:max-w-[670px] md:grid-cols-3 md:gap-2 md:pt-[59px] xl:max-w-[1238px] xl:gap-4 xl:px-0 xl:pt-6"
        >
          {summaryCards.map((summary, index) => (
            <article
              key={summary.title}
              className={[
                "flex h-[140px] flex-col justify-between rounded-2xl border border-border bg-surface px-4 py-3.5",
                "xl:h-[210px] xl:px-6 xl:py-8",
                index === 2 ? "col-span-2 md:col-span-1" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div>
                <h2 className="text-sm leading-6 font-bold text-snack-black-200 xl:text-2xl xl:leading-8">
                  {summary.title}
                </h2>
                <p className="text-[13px] leading-[22px] font-medium text-snack-gray-400 xl:mt-2 xl:text-xl xl:leading-8">
                  {summary.description}
                </p>
              </div>
              <strong className="text-lg leading-[26px] text-snack-black-200 xl:text-[32px] xl:leading-[42px]">
                {summary.amount}
              </strong>
            </article>
          ))}
        </section>

        <section className="mt-[-4px] flex h-16 items-center justify-end border-b-2 border-border px-6 md:mt-10 xl:mt-3.5 xl:mb-1.5 xl:h-[70px] xl:border-0 xl:px-0">
          <label className="relative block">
            <span className="sr-only">구매 내역 정렬</span>
            <select
              value={sort}
              onChange={handleSortChange}
              className="h-9 w-[120px] appearance-none rounded-lg border border-snack-gray-200 bg-surface py-1.5 pr-7 pl-2 text-sm leading-6 font-normal text-foreground-muted outline-none focus:border-accent xl:h-[50px] xl:w-[160px] xl:px-3.5 xl:pr-10 xl:text-lg xl:leading-[26px]"
            >
              <option value="latest">최신순</option>
              <option value="highPrice">가격 높은순</option>
              <option value="lowPrice">가격 낮은순</option>
            </select>
            <Icon
              name="chevron-down"
              size="xs"
              className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-snack-gray-400 xl:right-3"
            />
          </label>
        </section>

        {isPending ? (
          <p className="px-6 py-16 text-center text-foreground-muted xl:px-0">
            구매 내역을 불러오는 중…
          </p>
        ) : null}

        {isError ? (
          <p className="px-6 py-16 text-center text-snack-state-100 xl:px-0">
            {error instanceof Error
              ? error.message
              : "구매 내역을 불러오지 못했습니다."}
          </p>
        ) : null}

        {!isPending && !isError ? (
          <>
            <section
              aria-label="구매 내역"
              className={hasPurchaseHistory ? undefined : "hidden"}
            >
              <div className="hidden xl:block">
                <div className="grid h-20 grid-cols-[207px_1fr_219px_219px_219px_219px] items-center rounded-full border border-snack-gray-200 bg-surface px-20 text-center text-xl leading-8 font-medium text-snack-black-100">
                  <span>구매승인일</span>
                  <span>상품정보</span>
                  <span>주문 금액</span>
                  <span>요청인</span>
                  <span>담당자</span>
                  <span>구매요청일</span>
                </div>

                <ul className="mt-4">
                  {orders.map((purchase) => (
                    <li
                      key={purchase.id}
                      className="grid h-[104px] grid-cols-[207px_1fr_219px_219px_219px_219px] items-center border-b border-border px-20 text-center text-xl leading-8 text-snack-black-100"
                    >
                      <span>{formatDate(purchase.approvedAt)}</span>
                      <div className="text-left">
                        <p className="font-semibold text-snack-black-200">
                          {formatProductName(purchase)}
                        </p>
                        <p className="text-sm leading-6 font-medium text-foreground-muted">
                          총 수량: {purchase.itemCount}
                        </p>
                      </div>
                      <span>{formatPrice(purchase.totalPrice)}</span>
                      <span>{purchase.requesterName}</span>
                      <span>{purchase.processorName}</span>
                      <span>{formatDate(purchase.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <ul className="xl:hidden">
                {orders.map((purchase) => (
                  <li
                    key={purchase.id}
                    className="border-b-2 border-border px-6 pt-6 pb-6"
                  >
                    <div className="flex items-end gap-4">
                      <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-border bg-surface shadow-[4px_4px_10px_rgba(250,247,243,0.25)]">
                        <Image
                          src="/images/purchase-history-product.png"
                          alt=""
                          width={28}
                          height={49}
                          className="h-[49px] w-7 object-contain"
                        />
                      </div>
                      <div className="self-stretch pt-1">
                        <p className="text-sm leading-6 text-foreground-strong">
                          {formatProductName(purchase)}
                        </p>
                        <p className="text-xs leading-[18px] text-foreground-muted">
                          총 수량: {purchase.itemCount}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-b border-snack-gray-200 py-3 text-sm leading-6 font-semibold text-foreground-strong">
                      <span>주문금액</span>
                      <span>{formatPrice(purchase.totalPrice)}원</span>
                    </div>

                    <dl className="mt-4 space-y-2 text-sm leading-6 text-foreground-muted">
                      <div className="flex items-center justify-between">
                        <dt>구매승인일</dt>
                        <dd className="font-medium">
                          {formatDate(purchase.approvedAt)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt>구매요청일</dt>
                        <dd className="font-medium">
                          {formatDate(purchase.createdAt)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt>요청인</dt>
                        <dd className="font-medium">
                          {purchase.requesterName}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt>담당자</dt>
                        <dd className="font-medium">
                          {purchase.processorName}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </section>

            {!hasPurchaseHistory ? (
              <EmptyState
                aria-label="구매 내역 없음"
                image="empty-purchase"
                className="pt-16 md:pt-40 xl:pt-[179px]"
                contentClassName="h-[202px] w-[327px] xl:h-[304px] xl:w-[388px]"
                description={
                  <>
                    <span className="block">구매한 내역이 없어요</span>
                    <span className="block">
                      구매 요청을 승인하고 상품을 주문해보세요!
                    </span>
                  </>
                }
              />
            ) : null}

            <Pagination
              aria-label="구매 내역 페이지"
              items={paginationItems}
              currentPage={String(pagination?.currentPage ?? page)}
              previousDisabled={(pagination?.currentPage ?? page) <= 1}
              nextDisabled={!pagination?.hasNextPage}
              collapseMiddlePages
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() =>
                setPage((current) =>
                  pagination?.hasNextPage ? current + 1 : current,
                )
              }
              onPageSelect={(selected) => {
                const nextPage = Number(selected);
                if (Number.isInteger(nextPage) && nextPage > 0) {
                  setPage(nextPage);
                }
              }}
              className={[
                "mt-4 py-2 md:mt-8 md:py-0 xl:mt-10",
                hasPurchaseHistory ? "flex" : "hidden",
              ].join(" ")}
            />
          </>
        ) : null}
      </div>
    </main>
  );
}
