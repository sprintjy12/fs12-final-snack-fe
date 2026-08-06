"use client";

import Image from "next/image";
import { useState } from "react";

import {
  CancelPurchaseRequestModal,
  type CancelPurchaseRequestTarget,
} from "@/app/(private)/purchase/my-requests/CancelPurchaseRequestModal";
import { EmptyState, Icon, Pagination } from "@/components/ui";

export type PurchaseRequestHistoryStatus =
  | "pending"
  | "rejected"
  | "approved";

export type PurchaseRequestHistoryItem = {
  id: number;
  requestedAt: string;
  productName: string;
  quantity: number;
  amount: string;
  status: PurchaseRequestHistoryStatus;
};

type PurchaseRequestHistoryProps = {
  items: readonly PurchaseRequestHistoryItem[];
};

const STATUS_LABEL: Record<PurchaseRequestHistoryStatus, string> = {
  pending: "승인 대기",
  rejected: "구매 반려",
  approved: "승인 완료",
};

const paginationItems = ["1", "2", "3", "4", "5", "more", "9"] as const;

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "amountAsc", label: "낮은금액순" },
  { value: "amountDesc", label: "높은금액순" },
] as const;

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
export function PurchaseRequestHistory({ items }: PurchaseRequestHistoryProps) {
  const [cancelTarget, setCancelTarget] =
    useState<CancelPurchaseRequestTarget | null>(null);

  const hasItems = items.length > 0;
  // TODO: 뷰포트별 pageSize(모바일·태블릿 3 / 데스크톱 6) + 페이지네이션 연동
  const mobileItems = items.slice(0, 3);

  const openCancelModal = (item: PurchaseRequestHistoryItem) => {
    setCancelTarget({
      id: item.id,
      productName: item.productName,
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
          <select className="h-9 w-[87px] appearance-none rounded-lg border border-solid border-snack-gray-200 bg-surface py-1.5 pr-7 pl-2 text-sm leading-6 font-normal text-foreground-muted outline-none focus:border-accent xl:h-[50px] xl:w-[136px] xl:px-3.5 xl:pr-10 xl:text-lg xl:leading-[26px]">
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon
            name="chevron-down"
            size="xs"
            className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-snack-gray-400 xl:right-3"
          />
        </label>
      </section>

      {hasItems ? (
        <>
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
                  const isPending = item.status === "pending";

                  return (
                    <li
                      key={item.id}
                      className="grid h-[104px] grid-cols-[207px_1fr_219px_219px_219px] items-center border-b border-solid border-border px-20 text-center text-xl leading-8 text-snack-black-100"
                    >
                      <span>{item.requestedAt}</span>
                      <div className="text-left">
                        <p className="font-semibold text-snack-black-200">
                          {item.productName}
                        </p>
                        <p className="text-sm leading-6 font-medium text-foreground-muted">
                          총 수량: {item.quantity}개
                        </p>
                      </div>
                      <span>{item.amount}</span>
                      <span
                        className={
                          isPending
                            ? "text-snack-black-100"
                            : "text-snack-gray-300"
                        }
                      >
                        {STATUS_LABEL[item.status]}
                      </span>
                      <div className="flex items-center justify-center">
                        {isPending ? (
                          <CancelRequestButton
                            size="md"
                            onClick={() => openCancelModal(item)}
                          />
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <ul className="xl:hidden">
              {mobileItems.map((item) => {
                const isPending = item.status === "pending";

                return (
                  <li
                    key={item.id}
                    className="border-b-2 border-solid border-border px-6 pt-8 pb-8"
                  >
                    <div className="flex gap-4">
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
                            {item.productName}
                          </p>
                          <p className="text-xs leading-[18px] text-foreground-muted">
                            총 수량: {item.quantity}개
                          </p>
                        </div>
                        {isPending ? (
                          <div className="flex justify-end">
                            <CancelRequestButton
                              size="sm"
                              onClick={() => openCancelModal(item)}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-b border-solid border-snack-gray-200 py-3 text-base leading-[26px] font-semibold text-foreground-strong">
                      <span>주문금액</span>
                      <span>{item.amount}원</span>
                    </div>

                    <dl className="mt-3 space-y-2 text-sm leading-6">
                      <div className="flex items-center justify-between text-foreground-muted">
                        <dt>구매요청일</dt>
                        <dd className="font-medium">{item.requestedAt}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-foreground-muted">상태</dt>
                        <dd
                          className={[
                            "font-semibold",
                            isPending
                              ? "text-snack-black-200"
                              : "text-snack-gray-300",
                          ].join(" ")}
                        >
                          {STATUS_LABEL[item.status]}
                        </dd>
                      </div>
                    </dl>
                  </li>
                );
              })}
            </ul>
          </section>

          <Pagination
            aria-label="구매 요청 내역 페이지"
            items={paginationItems}
            previousDisabled
            collapseMiddlePages
            className="mt-4 flex py-2 md:mt-8 md:py-0 xl:mt-10"
          />
        </>
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

      <CancelPurchaseRequestModal
        open={Boolean(cancelTarget)}
        request={cancelTarget}
        onClose={() => setCancelTarget(null)}
      />
    </>
  );
}
