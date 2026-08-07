"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  PurchaseRequestDecisionModal,
  type PurchaseRequestDecisionMode,
  type PurchaseRequestDecisionTarget,
} from "@/app/(private)/purchase/requests/PurchaseRequestDecisionModal";
import { mapOrderRequestDetailToDecisionTarget } from "@/app/(private)/purchase/requests/mapOrderRequestDetailToDecisionTarget";
import { Pagination, type PaginationItem, showToast } from "@/components/ui";
import { useFetchOrderRequestDetail } from "@/hooks/queries/useOrderRequestDetail";
import type { OrderRequestListItem } from "@/types/orderTypes";

type PurchaseRequestsListProps = {
  requests: readonly OrderRequestListItem[];
  paginationItems: PaginationItem[];
  currentPage: string;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onPageSelect?: (page: string) => void;
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

const formatProductName = (request: OrderRequestListItem) => {
  const { firstProductName, itemCount } = request.itemsSummary;
  if (!firstProductName) {
    return "상품 정보 없음";
  }
  if (itemCount <= 1) {
    return firstProductName;
  }
  return `${firstProductName} 외 ${itemCount - 1}건`;
};

export function PurchaseRequestsList({
  requests,
  paginationItems,
  currentPage,
  previousDisabled,
  nextDisabled,
  onPrevious,
  onNext,
  onPageSelect,
}: PurchaseRequestsListProps) {
  const fetchOrderRequestDetail = useFetchOrderRequestDetail();
  const [mode, setMode] = useState<PurchaseRequestDecisionMode | null>(null);
  const [target, setTarget] = useState<PurchaseRequestDecisionTarget | null>(
    null,
  );
  const [isOpening, setIsOpening] = useState(false);

  const openModal = async (
    request: OrderRequestListItem,
    nextMode: PurchaseRequestDecisionMode,
  ) => {
    if (isOpening) {
      return;
    }

    setIsOpening(true);
    try {
      const response = await fetchOrderRequestDetail(request.id);
      setTarget(mapOrderRequestDetailToDecisionTarget(response.data));
      setMode(nextMode);
    } catch {
      showToast("구매 요청 상세를 불러오지 못했습니다.");
    } finally {
      setIsOpening(false);
    }
  };

  const closeModal = () => {
    setMode(null);
    setTarget(null);
  };

  return (
    <>
      <section aria-label="구매 요청 목록">
        <div className="hidden xl:block">
          <div className="grid h-20 grid-cols-[207px_1fr_219px_219px_219px] items-center rounded-full border border-solid border-snack-gray-200 bg-surface px-20 text-center text-xl leading-8 font-medium text-snack-black-100">
            <span>구매요청일</span>
            <span>상품정보</span>
            <span>주문 금액</span>
            <span>요청인</span>
            <span>비고</span>
          </div>

          <ul className="mt-4">
            {requests.map((request) => {
              const productName = formatProductName(request);
              const detailHref = `/purchase/requests/${request.id}`;

              return (
                <li
                  key={request.id}
                  className="relative grid h-[104px] grid-cols-[207px_1fr_219px_219px_219px] items-center border-b border-solid border-border px-20 text-center text-xl leading-8 text-snack-black-100 transition-colors hover:bg-surface"
                >
                  <Link
                    href={detailHref}
                    className="absolute inset-0 z-0"
                    aria-label={`${productName} 상세 보기`}
                  />
                  <span className="relative z-10 pointer-events-none">
                    {formatDate(request.requestedAt)}
                  </span>
                  <div className="relative z-10 pointer-events-none text-left">
                    <p className="font-semibold text-snack-black-200">
                      {productName}
                    </p>
                    <p className="text-sm leading-6 font-medium text-foreground-muted">
                      총 수량: {request.totalQuantity}
                    </p>
                  </div>
                  <span className="relative z-10 pointer-events-none">
                    {formatPrice(request.totalPrice)}
                  </span>
                  <span className="relative z-10 pointer-events-none">
                    {request.requesterName}
                  </span>
                  <div className="relative z-10 pointer-events-none flex items-center justify-center">
                    <div className="pointer-events-auto flex gap-2">
                      <button
                        type="button"
                        disabled={isOpening}
                        onClick={() => openModal(request, "reject")}
                        className="h-11 w-[94px] cursor-pointer rounded-lg bg-snack-background-300 text-lg leading-[26px] font-semibold text-foreground-muted disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        반려
                      </button>
                      <button
                        type="button"
                        disabled={isOpening}
                        onClick={() => openModal(request, "approve")}
                        className="h-11 w-[94px] cursor-pointer rounded-lg bg-accent text-lg leading-[26px] font-semibold text-surface disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        승인
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <ul className="xl:hidden">
          {requests.map((request) => {
            const productName = formatProductName(request);
            const detailHref = `/purchase/requests/${request.id}`;

            return (
              <li
                key={request.id}
                className="relative block h-[280px] border-b-2 border-solid border-border px-6 pt-6 pb-6 transition-colors hover:bg-surface"
              >
                <Link
                  href={detailHref}
                  className="absolute inset-0 z-0"
                  aria-label={`${productName} 상세 보기`}
                />
                <div className="relative z-10 pointer-events-none flex h-[100px] gap-4">
                  <div className="flex size-[100px] shrink-0 items-center justify-center rounded-lg border border-solid border-border bg-surface shadow-[4px_4px_10px_rgba(250,247,243,0.25)]">
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
                        {productName}
                      </p>
                      <p className="text-xs leading-[18px] text-foreground-muted">
                        총 수량: {request.totalQuantity}
                      </p>
                    </div>
                    <div className="pointer-events-auto flex gap-2">
                      <button
                        type="button"
                        disabled={isOpening}
                        onClick={() => openModal(request, "reject")}
                        className="h-[34px] flex-1 cursor-pointer rounded-lg bg-snack-background-300 text-[13px] leading-[22px] font-semibold text-foreground-muted disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        반려
                      </button>
                      <button
                        type="button"
                        disabled={isOpening}
                        onClick={() => openModal(request, "approve")}
                        className="h-[34px] flex-1 cursor-pointer rounded-lg bg-accent text-[13px] leading-[22px] font-semibold text-surface disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        승인
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pointer-events-none mt-4 flex items-center justify-between border-b border-solid border-snack-gray-200 py-3 text-sm leading-6 font-semibold text-foreground-strong">
                  <span>주문금액</span>
                  <span>{formatPrice(request.totalPrice)}원</span>
                </div>

                <dl className="relative z-10 pointer-events-none mt-3 space-y-2 text-sm leading-6 text-foreground-muted">
                  <div className="flex items-center justify-between">
                    <dt>구매요청일</dt>
                    <dd className="font-medium">
                      {formatDate(request.requestedAt)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>요청인</dt>
                    <dd className="font-medium">{request.requesterName}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </section>

      <Pagination
        aria-label="구매 요청 페이지"
        items={paginationItems}
        currentPage={currentPage}
        previousDisabled={previousDisabled}
        nextDisabled={nextDisabled}
        collapseMiddlePages
        onPrevious={onPrevious}
        onNext={onNext}
        onPageSelect={onPageSelect}
        className={[
          "mt-4 py-2 md:mt-8 md:py-0 xl:mt-[298px]",
          requests.length > 0 ? "flex" : "hidden",
        ].join(" ")}
      />

      <PurchaseRequestDecisionModal
        open={Boolean(mode && target)}
        mode={mode}
        request={target}
        showResultModal={false}
        onClose={closeModal}
      />
    </>
  );
}
