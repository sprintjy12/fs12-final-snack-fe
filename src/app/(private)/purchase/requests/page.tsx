"use client";

import Image from "next/image";
import { useMemo, useState, type ChangeEvent } from "react";
import axios from "axios";

import { PurchaseRequestsList } from "@/app/(private)/purchase/requests/PurchaseRequestsList";
import {
  EmptyState,
  Icon,
  buildPaginationItems,
} from "@/components/ui";
import { useOrderRequests } from "@/hooks/queries/useOrderRequests";
import type { OrderRequestListSort } from "@/types/orderTypes";

const PAGE_SIZE = 10;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export default function PurchaseRequestsPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<OrderRequestListSort>("latest");

  const { data, isPending, isError, error } = useOrderRequests({
    page,
    limit: PAGE_SIZE,
    sort,
  });

  const requests = data?.data ?? [];
  const pagination = data?.pagination;
  const hasPurchaseRequests = requests.length > 0;

  const paginationItems = useMemo(
    () =>
      buildPaginationItems(
        pagination?.currentPage ?? page,
        pagination?.totalPages ?? 0,
      ),
    [pagination?.currentPage, pagination?.totalPages, page],
  );

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextSort = event.target.value as OrderRequestListSort;
    setSort(nextSort);
    setPage(1);
  };

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
            <select
              value={sort}
              onChange={handleSortChange}
              className="h-9 w-[120px] appearance-none rounded-lg border border-solid border-snack-gray-200 bg-surface py-1.5 pr-7 pl-2 text-sm leading-6 font-normal text-foreground-muted outline-none focus:border-accent xl:h-[50px] xl:w-[160px] xl:px-3.5 xl:pr-10 xl:text-lg xl:leading-[26px]"
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
            구매 요청을 불러오는 중…
          </p>
        ) : null}

        {isError ? (
          <p className="px-6 py-16 text-center text-snack-state-100 xl:px-0">
            {getErrorMessage(error, "구매 요청을 불러오지 못했습니다.")}
          </p>
        ) : null}

        {!isPending && !isError ? (
          <>
            {hasPurchaseRequests ? (
              <PurchaseRequestsList
                requests={requests}
                paginationItems={paginationItems}
                currentPage={String(pagination?.currentPage ?? page)}
                previousDisabled={(pagination?.currentPage ?? page) <= 1}
                nextDisabled={!pagination?.hasNextPage}
                onPrevious={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
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
              />
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
          </>
        ) : null}
      </div>
    </main>
  );
}
