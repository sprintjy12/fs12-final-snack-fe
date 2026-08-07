"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ChangeEvent } from "react";

import {
  CancelPurchaseRequestModal,
  type CancelPurchaseRequestTarget,
} from "@/app/(private)/purchase/my-requests/CancelPurchaseRequestModal";
import {
  EmptyState,
  Icon,
  Pagination,
  type PaginationItem,
} from "@/components/ui";
import { useMyOrderRequests } from "@/hooks/queries/useMyOrderRequests";
import type {
  MyOrderRequestListItem,
  OrderListSort,
} from "@/types/orderTypes";

const PAGE_SIZE = 10;

type MyRequestStatus = "pending" | "rejected" | "approved";

const STATUS_LABEL: Record<MyRequestStatus, string> = {
  pending: "승인 대기",
  rejected: "구매 반려",
  approved: "승인 완료",
};

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

const formatProductName = (item: MyOrderRequestListItem) => {
  const { firstProductName, itemCount } = item;
  if (!firstProductName) {
    return "상품 정보 없음";
  }
  if (itemCount <= 1) {
    return firstProductName;
  }
  return `${firstProductName} 외 ${itemCount - 1}건`;
};

/** approvedAt / processorName으로 목록 상태 표시 */
const getRequestStatus = (item: MyOrderRequestListItem): MyRequestStatus => {
  if (item.approvedAt) {
    return "approved";
  }
  if (item.processorName) {
    return "rejected";
  }
  return "pending";
};

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

function CancelRequestButton({
  size,
  onClick,
}: {
  size: "sm" | "md";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "cursor-pointer rounded-lg border border-solid font-semibold text-accent",
        size === "md"
          ? "border-accent px-4 py-2 text-lg leading-[26px]"
          : "border-snack-orange-300 px-3 py-1.5 text-[13px] leading-[22px]",
      ].join(" ")}
    >
      요청 취소
    </button>
  );
}

/**
 * 내 구매 요청 내역 목록 (+ 빈 상태).
 */
export function PurchaseRequestHistory() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<OrderListSort>("latest");
  const [cancelTarget, setCancelTarget] =
    useState<CancelPurchaseRequestTarget | null>(null);

  const { data, isPending, isError, error } = useMyOrderRequests({
    page,
    limit: PAGE_SIZE,
    sort,
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;
  const hasItems = items.length > 0;

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

  const openCancelModal = (item: MyOrderRequestListItem) => {
    setCancelTarget({
      id: item.id,
      productName: formatProductName(item),
    });
  };

  return (
    <>
      <section className="flex h-16 items-center justify-between gap-4 border-b border-solid border-border px-6 xl:h-36 xl:border-0 xl:px-0">
        <h1 className="text-xl leading-8 font-semibold text-foreground-strong md:ml-2.5 xl:text-[32px] xl:leading-[42px]">
          구매 요청 내역
        </h1>

        <label className="relative block shrink-0">
          <span className="sr-only">구매 요청 내역 정렬</span>
          <select
            value={sort}
            onChange={handleSortChange}
            className="h-9 w-[87px] appearance-none rounded-lg border border-solid border-snack-gray-200 bg-surface py-1.5 pr-7 pl-2 text-sm leading-6 font-normal text-foreground-muted outline-none focus:border-accent xl:h-[50px] xl:w-[136px] xl:px-3.5 xl:pr-10 xl:text-lg xl:leading-[26px]"
          >
            <option value="latest">최신순</option>
            <option value="lowPrice">낮은금액순</option>
            <option value="highPrice">높은금액순</option>
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
          구매 요청 내역을 불러오는 중…
        </p>
      ) : null}

      {isError ? (
        <p className="px-6 py-16 text-center text-snack-state-100 xl:px-0">
          {error instanceof Error
            ? error.message
            : "구매 요청 내역을 불러오지 못했습니다."}
        </p>
      ) : null}

      {!isPending && !isError ? (
        <>
          {hasItems ? (
            <section aria-label="구매 요청 내역 목록">
              <div className="hidden xl:block">
                <div className="grid h-20 grid-cols-[207px_1fr_219px_219px_219px] items-center rounded-full border border-solid border-snack-gray-200 bg-surface px-20 text-center text-xl leading-8 font-medium text-snack-black-100">
                  <span>구매요청일</span>
                  <span>상품정보</span>
                  <span>주문 금액</span>
                  <span>상태</span>
                  <span>비고</span>
                </div>

                <ul className="mt-4">
                  {items.map((item) => {
                    const status = getRequestStatus(item);
                    const isPendingStatus = status === "pending";
                    const productName = formatProductName(item);
                    const detailHref = `/purchase/my-requests/${item.id}`;

                    return (
                      <li
                        key={item.id}
                        className="relative grid h-[104px] grid-cols-[207px_1fr_219px_219px_219px] items-center border-b border-solid border-border px-20 text-center text-xl leading-8 text-snack-black-100"
                      >
                        <Link
                          href={detailHref}
                          className="absolute inset-0 z-0"
                          aria-label={`${productName} 상세 보기`}
                        />
                        <span className="relative z-10 pointer-events-none">
                          {formatDate(item.createdAt)}
                        </span>
                        <div className="relative z-10 pointer-events-none text-left">
                          <p className="font-semibold text-snack-black-200">
                            {productName}
                          </p>
                          <p className="text-sm leading-6 font-medium text-foreground-muted">
                            총 수량: {item.totalQuantity}개
                          </p>
                        </div>
                        <span className="relative z-10 pointer-events-none">
                          {formatPrice(item.totalPrice)}
                        </span>
                        <span
                          className={[
                            "relative z-10 pointer-events-none",
                            isPendingStatus
                              ? "text-snack-black-100"
                              : "text-snack-gray-300",
                          ].join(" ")}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                        <div className="relative z-10 pointer-events-none flex items-center justify-center">
                          {isPendingStatus ? (
                            <div className="pointer-events-auto">
                              <CancelRequestButton
                                size="md"
                                onClick={() => openCancelModal(item)}
                              />
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <ul className="xl:hidden">
                {items.map((item) => {
                  const status = getRequestStatus(item);
                  const isPendingStatus = status === "pending";
                  const productName = formatProductName(item);
                  const detailHref = `/purchase/my-requests/${item.id}`;

                  return (
                    <li
                      key={item.id}
                      className="relative border-b-2 border-solid border-border px-6 pt-8 pb-8"
                    >
                      <Link
                        href={detailHref}
                        className="absolute inset-0 z-0"
                        aria-label={`${productName} 상세 보기`}
                      />
                      <div className="relative z-10 pointer-events-none flex gap-4">
                        <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-solid border-border bg-surface shadow-[4px_4px_10px_rgba(250,247,243,0.25)]">
                          <Image
                            src="/images/purchase-history-product.png"
                            alt=""
                            width={28}
                            height={49}
                            className="h-[49px] w-7 object-contain"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            <p className="text-sm leading-6 text-foreground-strong">
                              {productName}
                            </p>
                            <p className="text-xs leading-[18px] text-foreground-muted">
                              총 수량: {item.totalQuantity}개
                            </p>
                          </div>
                          {isPendingStatus ? (
                            <div className="pointer-events-auto flex justify-end">
                              <CancelRequestButton
                                size="sm"
                                onClick={() => openCancelModal(item)}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="relative z-10 pointer-events-none mt-4 flex items-center justify-between border-b border-solid border-snack-gray-200 py-3 text-base leading-[26px] font-semibold text-foreground-strong">
                        <span>주문금액</span>
                        <span>{formatPrice(item.totalPrice)}원</span>
                      </div>

                      <dl className="relative z-10 pointer-events-none mt-3 space-y-2 text-sm leading-6">
                        <div className="flex items-center justify-between text-foreground-muted">
                          <dt>구매요청일</dt>
                          <dd className="font-medium">
                            {formatDate(item.createdAt)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="text-foreground-muted">상태</dt>
                          <dd
                            className={[
                              "font-semibold",
                              isPendingStatus
                                ? "text-snack-black-200"
                                : "text-snack-gray-300",
                            ].join(" ")}
                          >
                            {STATUS_LABEL[status]}
                          </dd>
                        </div>
                      </dl>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : (
            <EmptyState
              aria-label="구매 요청 내역 없음"
              image="empty-purchase"
              className="pt-16 md:pt-40 xl:pt-[148px]"
              contentClassName="h-[202px] w-[327px] xl:h-[304px] xl:w-[388px]"
              description={
                <>
                  <span className="block">구매 요청한 내역이 없어요</span>
                  <span className="block">
                    상품 리스트를 둘러보고 관리자에게 요청해보세요!
                  </span>
                </>
              }
            />
          )}

          <Pagination
            aria-label="구매 요청 내역 페이지"
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
              hasItems ? "flex" : "hidden",
            ].join(" ")}
          />
        </>
      ) : null}

      <CancelPurchaseRequestModal
        open={Boolean(cancelTarget)}
        request={cancelTarget}
        onClose={() => setCancelTarget(null)}
      />
    </>
  );
}
