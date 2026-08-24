"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { ensureAccessToken } from "@/api/authApi";
import { getMyOrderRequestDetail } from "@/api/orderApi";
import {
  clearPurchaseRequestComplete,
  getPurchaseRequestComplete,
  type PurchaseRequestCompleteSummary,
} from "@/lib/purchaseRequestComplete";

type CompleteSummary = PurchaseRequestCompleteSummary;

/** 시안 확인용. session/orderId 없을 때만 사용 */
const MOCK_SUMMARY: CompleteSummary = {
  name: "코카콜라 제로",
  extraCount: 8,
  totalCount: 9,
  totalAmount: 43_000,
  categoryLabel: "청량 ・ 탄산음료",
  photo: "",
  requestMessage: "코카콜라 제로 인기가 많아요.\n많이 주문하면 좋을 것 같아요!",
  orderId: null,
};

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
  const [summary, setSummary] = useState<CompleteSummary>(MOCK_SUMMARY);
  const [imageFailed, setImageFailed] = useState(false);
  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "ready" | "error"
  >(orderId ? "loading" : "idle");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 이전 요청의 완료 화면을 남겨둔 채 다른 orderId로 재진입하면
      // 세션 요약이 지금 조회하려는 주문과 다를 수 있으므로 일치할 때만 신뢰합니다.
      const session = getPurchaseRequestComplete();
      if (session && (!orderId || session.orderId === orderId)) {
        if (!cancelled) {
          setSummary(session);
          setLoadState("ready");
        }
        clearPurchaseRequestComplete();
        return;
      }

      if (!orderId) {
        if (!cancelled) {
          setSummary(MOCK_SUMMARY);
          setLoadState("ready");
        }
        return;
      }

      try {
        await ensureAccessToken();
        const response = await getMyOrderRequestDetail(orderId);
        const detail = response.data;
        const first = detail.items[0];
        if (!cancelled) {
          setSummary({
            name: first?.productName ?? "상품 정보 없음",
            extraCount: Math.max(0, detail.itemCount - 1),
            totalCount: detail.totalQuantity,
            totalAmount: detail.totalPrice,
            categoryLabel: first?.categoryName ?? "",
            photo: first?.imageUrl ?? "",
            requestMessage: detail.requestMessage ?? "",
            orderId: detail.orderId,
          });
          setLoadState("ready");
        }
      } catch {
        // 실패를 목업 데이터로 가리면 존재하지 않는 주문을 실제 주문처럼
        // 보여주게 되므로, 실패는 실패로 표시하고 재시도 수단을 줍니다.
        if (!cancelled) {
          setLoadState("error");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId, attempt]);

  const handleRetry = () => {
    setLoadState("loading");
    setAttempt((current) => current + 1);
  };

  useEffect(() => {
    setImageFailed(false);
  }, [summary.photo]);

  const showImage = Boolean(summary.photo) && !imageFailed;
  const requestLines = useMemo(() => {
    const lines = summary.requestMessage
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    return lines.length > 0 ? lines : ["(요청 메시지 없음)"];
  }, [summary.requestMessage]);

  return (
    <main className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-surface-muted px-6 py-10">
      <div className="flex w-full max-w-[688px] flex-col gap-8 rounded-[32px] bg-surface-muted px-6 pt-8 pb-10 max-md:max-w-[375px]">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="m-0 text-[32px] leading-[42px] font-bold text-foreground-strong max-md:text-2xl max-md:leading-8">
            구매 요청 완료
          </h1>
          <p className="m-0 text-base leading-[26px] text-foreground-muted max-md:text-sm max-md:leading-6">
            관리자에게 성공적으로 구매 요청이 완료되었습니다.
          </p>
        </header>

        {loadState === "loading" ? (
          <p className="m-0 py-16 text-center text-foreground-muted">
            주문 정보를 불러오는 중…
          </p>
        ) : loadState === "error" ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="m-0 text-foreground-muted">
              주문 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-2xl bg-accent px-6 py-3 text-base font-semibold text-surface"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <section
            className="flex w-full flex-col gap-8 border-y-2 border-border bg-surface-muted p-8 max-md:gap-4 max-md:px-0 max-md:py-6"
            aria-label="구매 요청 요약"
          >
            <div className="flex flex-col gap-4">
              <h2 className="m-0 text-xl leading-8 font-semibold text-foreground-strong max-md:text-base max-md:leading-[26px]">
                상품정보
              </h2>
              <div className="flex items-start gap-6">
                <div className="box-border flex size-[120px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted max-md:size-16">
                  {showImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={summary.photo}
                      src={summary.photo}
                      alt=""
                      className="size-full object-cover"
                      onError={() => setImageFailed(true)}
                    />
                  ) : null}
                </div>
                <div className="flex flex-col justify-center gap-0.5 self-stretch">
                  <p className="m-0 text-lg leading-[26px] font-medium text-foreground-strong max-md:text-sm max-md:leading-6">
                    {formatProductLabel(summary.name, summary.extraCount)}
                  </p>
                  {summary.categoryLabel ? (
                    <p className="m-0 text-sm leading-6 font-normal text-foreground-muted max-md:text-xs max-md:leading-[18px]">
                      {summary.categoryLabel}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex w-full items-center justify-between">
              <strong className="text-2xl leading-8 font-bold text-foreground-strong max-md:text-lg max-md:leading-[26px]">
                총 {summary.totalCount}개
              </strong>
              <strong className="text-center text-[32px] leading-[42px] font-bold text-accent max-md:text-xl max-md:leading-8">
                {formatPrice(summary.totalAmount)}
              </strong>
            </div>

            <hr className="m-0 w-full border-0 border-t border-border" />

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
            href="/purchase/my-requests"
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
