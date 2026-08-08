"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { useOrderRequestDetail } from "@/hooks/queries/useOrderRequestDetail";
import type { OrderRequestDetailData } from "@/types/orderTypes";

type CompleteSummary = {
  name: string;
  extraCount: number;
  totalQuantity: number;
  productAmount: number;
  shippingFee: number;
  totalPrice: number;
  categoryLabel: string;
  imageUrl: string;
  requestMessage: string;
  orderId: string;
};

/** 시안 확인용. orderId 없이 진입했을 때만 사용 */
const MOCK_SUMMARY: CompleteSummary = {
  name: "코카콜라 제로",
  extraCount: 8,
  totalQuantity: 9,
  productAmount: 40_000,
  shippingFee: 3_000,
  totalPrice: 43_000,
  categoryLabel: "청량 ・탄산음료",
  imageUrl: "",
  requestMessage: "코카콜라 제로 인기가 많아요.\n많이 주문하면 좋을 것 같아요!",
  orderId: "",
};

/** BE 응답 → 화면용 요약 */
function toSummary(detail: OrderRequestDetailData): CompleteSummary {
  const first = detail.items[0];
  return {
    name: first?.productName ?? "상품 정보 없음",
    // "외 N개"의 N = 대표 상품을 제외한 나머지 품목 종류 수
    extraCount: Math.max(0, detail.itemCount - 1),
    totalQuantity: detail.totalQuantity,
    productAmount: detail.productAmount,
    shippingFee: detail.shippingFee,
    totalPrice: detail.totalPrice,
    categoryLabel: first?.categoryName ?? "",
    imageUrl: first?.imageUrl ?? "",
    requestMessage: detail.requestMessage ?? "",
    orderId: detail.orderId,
  };
}

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function formatProductLabel(name: string, extraCount: number) {
  if (extraCount <= 0) return name;
  return `${name} 외 ${extraCount}개`;
}

const buttonBase =
  "flex flex-1 items-center justify-center rounded-2xl text-center text-xl leading-8 font-semibold no-underline max-md:h-[54px] max-md:w-full max-md:flex-none max-md:text-base max-md:leading-[26px] h-16";

function PurchaseRequestCompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";

  // orderId가 빈 문자열이면 훅 내부 enabled:false로 조회하지 않음
  const { data, isLoading, isError } = useOrderRequestDetail(orderId);

  const summary: CompleteSummary | null = useMemo(() => {
    if (!orderId) return MOCK_SUMMARY;
    if (!data?.data) return null;
    return toSummary(data.data);
  }, [orderId, data]);

  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    setImageFailed(false);
  }, [summary?.imageUrl]);

  const showImage = Boolean(summary?.imageUrl) && !imageFailed;

  const requestLines = useMemo(() => {
    const lines = (summary?.requestMessage ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    return lines.length > 0 ? lines : ["(요청 메시지 없음)"];
  }, [summary?.requestMessage]);

  const showLoading = Boolean(orderId) && isLoading;
  const showError = Boolean(orderId) && (isError || (!isLoading && !summary));

  return (
    <main className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-surface-muted px-6 py-10">
      <div className="flex w-full max-w-[688px] flex-col gap-8 rounded-[32px] bg-surface-muted px-6 pt-8 pb-10 max-md:max-w-[375px]">
        <h1 className="m-0 text-2xl leading-8 font-semibold text-foreground-strong max-md:text-lg max-md:leading-[26px]">
          상품정보
        </h1>

        {showLoading ? (
          <p className="m-0 py-20 text-center text-foreground-muted">
            주문 정보를 불러오는 중…
          </p>
        ) : showError || !summary ? (
          <section
            className="flex w-full flex-col items-center gap-4 border-y-2 border-border py-20"
            aria-label="구매 요청 조회 실패"
          >
            <p className="m-0 text-lg leading-[26px] font-medium text-foreground-strong">
              주문 정보를 불러오지 못했어요.
            </p>
            <p className="m-0 text-sm leading-6 text-foreground-muted">
              요청 내역에서 다시 확인해 주세요.
            </p>
          </section>
        ) : (
          <section
            className="flex w-full flex-col gap-8 border-y-2 border-border bg-surface-muted p-8 max-md:gap-4 max-md:px-0 max-md:py-6"
            aria-label="구매 요청 요약"
          >
            <div className="flex items-start gap-6">
              <div className="box-border flex size-[120px] shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted p-6 max-md:size-16 max-md:p-3">
                {showImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={summary.imageUrl}
                    src={summary.imageUrl}
                    alt=""
                    className="block max-h-full max-w-full object-contain"
                    onError={() => setImageFailed(true)}
                  />
                ) : null}
              </div>
              <div className="flex flex-col justify-center gap-0.5 self-stretch">
                <p className="m-0 text-lg leading-[26px] font-medium text-foreground-strong max-md:text-sm max-md:leading-6">
                  {formatProductLabel(summary.name, summary.extraCount)}
                </p>
                <p className="m-0 text-sm leading-6 font-normal text-foreground-muted max-md:text-xs max-md:leading-[18px]">
                  {summary.categoryLabel}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3">
              <div className="flex w-full items-center justify-between">
                <span className="text-lg leading-[26px] font-medium text-foreground-muted max-md:text-sm max-md:leading-6">
                  총 {summary.totalQuantity}개 상품 금액
                </span>
                <span className="text-lg leading-[26px] font-medium text-foreground-strong max-md:text-sm max-md:leading-6">
                  {formatPrice(summary.productAmount)}
                </span>
              </div>

              <div className="flex w-full items-center justify-between">
                <span className="text-lg leading-[26px] font-medium text-foreground-muted max-md:text-sm max-md:leading-6">
                  배송비
                </span>
                <span className="text-lg leading-[26px] font-medium text-foreground-strong max-md:text-sm max-md:leading-6">
                  {summary.shippingFee > 0
                    ? formatPrice(summary.shippingFee)
                    : "무료"}
                </span>
              </div>

              <hr className="m-0 w-full border-0 border-t border-border" />

              <div className="flex w-full items-center justify-between">
                <strong className="text-2xl leading-8 font-bold text-foreground-strong max-md:text-lg max-md:leading-[26px]">
                  총 주문 금액
                </strong>
                <strong className="text-center text-[32px] leading-[42px] font-bold text-accent max-md:text-xl max-md:leading-8">
                  {formatPrice(summary.totalPrice)}
                </strong>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4">
              <h2 className="m-0 text-xl leading-8 font-semibold text-foreground-strong max-md:text-base max-md:leading-[26px]">
                요청 메시지
              </h2>
              <div className="flex min-h-40 flex-col overflow-hidden rounded-2xl border border-border bg-surface-muted px-6 py-3.5 max-md:px-4">
                {requestLines.map((line, index) => (
                  <p
                    key={`${index}-${line}`}
                    className="m-0 text-lg leading-[26px] font-normal text-foreground-muted max-md:text-sm max-md:leading-6"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="flex w-full max-w-[640px] items-center justify-between gap-5 max-md:max-w-none max-md:flex-col max-md:gap-3">
          <Link
            href="/cart"
            className={`${buttonBase} bg-snack-background-500 text-accent max-md:order-2`}
          >
            장바구니로 돌아가기
          </Link>
          <Link
            href="/purchase/requests?view=history"
            className={`${buttonBase} bg-accent text-surface max-md:order-1`}
          >
            요청 내역 확인하기
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PurchaseRequestCompletePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-surface-muted px-6 py-10">
          <p className="m-0 text-foreground-muted">불러오는 중…</p>
        </main>
      }
    >
      <PurchaseRequestCompleteContent />
    </Suspense>
  );
}
