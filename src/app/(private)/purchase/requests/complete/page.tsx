"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { getProductPhotoSrc } from "@/lib/productMedia";

const STORAGE_KEY = "snack.purchaseRequestComplete";

/** 시안용 더미. BE 응답/세션이 없으면 사용 */
const MOCK_SUMMARY = {
  name: "코카콜라 제로",
  extraCount: 8,
  totalCount: 9,
  totalAmount: 43_000,
  categoryLabel: "청량 ・탄산음료",
  photo: "코카콜라_제로.png",
  requestMessage: "코카콜라 제로 인기가 많아요.\n많이 주문하면 좋을 것 같아요!",
  orderId: null as string | null,
  source: "mock" as const,
};

const quantitySchema = z.number().finite().int().nonnegative();
const amountSchema = z.number().finite().nonnegative();

const completeSummarySchema = z.object({
  name: z.string().min(1),
  totalCount: quantitySchema,
  totalAmount: amountSchema,
  extraCount: quantitySchema.optional(),
  categoryLabel: z.string().optional(),
  photo: z.string().optional(),
  requestMessage: z.string().optional(),
  orderId: z.string().nullable().optional(),
});

type SummarySource = "be-api" | "session";

type ParsedSummary = {
  name: string;
  totalCount: number;
  totalAmount: number;
  extraCount: number;
  categoryLabel: string;
  photo: string;
  requestMessage: string;
  orderId: string | null;
  source: SummarySource;
};

type CompleteSummary = typeof MOCK_SUMMARY | ParsedSummary;

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function formatProductLabel(name: string, extraCount: number) {
  if (extraCount <= 0) return name;
  return `${name} 외 ${extraCount}개`;
}

function parseSummary(
  raw: unknown,
  source: SummarySource,
): CompleteSummary | null {
  const result = completeSummarySchema.safeParse(raw);
  if (!result.success) return null;

  const data = result.data;
  return {
    name: data.name,
    totalCount: data.totalCount,
    totalAmount: data.totalAmount,
    extraCount:
      data.extraCount !== undefined
        ? data.extraCount
        : Math.max(0, data.totalCount - 1),
    categoryLabel: data.categoryLabel ?? "",
    photo: data.photo ?? "",
    requestMessage: data.requestMessage ?? "",
    orderId: data.orderId ?? null,
    source,
  };
}

function parseSessionSummary(raw: string): CompleteSummary | null {
  try {
    return parseSummary(JSON.parse(raw) as unknown, "session");
  } catch {
    return null;
  }
}

const buttonBase =
  "flex flex-1 items-center justify-center rounded-2xl text-center text-xl leading-8 font-semibold no-underline max-md:h-[54px] max-md:w-full max-md:flex-none max-md:text-base max-md:leading-[26px] h-16";

function PurchaseRequestCompleteContent() {
  const searchParams = useSearchParams();
  const fromApi = searchParams.get("from") === "api";
  const [summary, setSummary] = useState<CompleteSummary>(MOCK_SUMMARY);
  const [imageFailed, setImageFailed] = useState(false);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready">(
    fromApi ? "loading" : "idle",
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const sessionRaw = sessionStorage.getItem(STORAGE_KEY);
      if (sessionRaw) {
        const parsed = parseSessionSummary(sessionRaw);
        if (parsed && !cancelled) {
          setSummary(parsed);
          setLoadState("ready");
          return;
        }
      }

      if (fromApi) {
        try {
          const response = await fetch("/complete-preview.json", {
            cache: "no-store",
          });
          if (response.ok) {
            const parsed = parseSummary(await response.json(), "be-api");
            if (parsed && !cancelled) {
              setSummary(parsed);
              setLoadState("ready");
              return;
            }
          }
        } catch {
          // fall through to mock
        }
      }

      if (!cancelled) {
        setSummary(MOCK_SUMMARY);
        setLoadState("ready");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [fromApi]);

  const photoSrc = getProductPhotoSrc(summary.photo);
  const showImage = Boolean(photoSrc) && !imageFailed;
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
        <div className="flex items-center justify-between gap-3">
          <h1 className="m-0 text-2xl leading-8 font-semibold text-foreground-strong max-md:text-lg max-md:leading-[26px]">
            상품정보
          </h1>
          {summary.source !== "mock" ? (
            <span className="rounded-full bg-snack-background-500 px-3 py-1 text-xs font-semibold text-accent">
              BE {summary.source === "be-api" ? "API" : "session"}
              {summary.orderId ? ` · ${summary.orderId.slice(0, 8)}` : ""}
            </span>
          ) : null}
        </div>

        {loadState === "loading" ? (
          <p className="m-0 text-foreground-muted">주문 정보를 불러오는 중…</p>
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
                    src={photoSrc!}
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
                {requestLines.map((line) => (
                  <p
                    key={line}
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
