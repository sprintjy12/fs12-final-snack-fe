"use client";

import Link from "next/link";
import { useState } from "react";

import { getProductPhotoSrc } from "@/lib/productMedia";

/** 시안용 더미. 모달/API 연동 시 교체 */
const COMPLETE_SUMMARY = {
  name: "코카콜라 제로",
  extraCount: 8,
  totalCount: 9,
  totalAmount: 43_000,
  categoryLabel: "청량 ・탄산음료",
  photo: "코카콜라_제로.png",
} as const;

/** 시안용 더미 메시지(추후 모달 제출값으로 교체) */
const COMPLETE_REQUEST_LINES = [
  "코카콜라 제로 인기가 많아요.",
  "많이 주문하면 좋을 것 같아요!",
] as const;

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function formatProductLabel(name: string, extraCount: number) {
  if (extraCount <= 0) return name;
  return `${name} 외 ${extraCount}개`;
}

const buttonBase =
  "flex flex-1 items-center justify-center rounded-2xl text-center text-xl leading-8 font-semibold no-underline max-md:h-[54px] max-md:w-full max-md:flex-none max-md:text-base max-md:leading-[26px] h-16";

export default function PurchaseRequestCompletePage() {
  const [imageFailed, setImageFailed] = useState(false);
  const photoSrc = getProductPhotoSrc(COMPLETE_SUMMARY.photo);
  const showImage = Boolean(photoSrc) && !imageFailed;

  return (
    <main className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-surface-muted px-6 py-10">
      <div className="flex w-full max-w-[688px] flex-col gap-8 rounded-[32px] bg-surface-muted px-6 pt-8 pb-10 max-md:max-w-[375px]">
        <h1 className="m-0 text-2xl leading-8 font-semibold text-foreground-strong max-md:text-lg max-md:leading-[26px]">
          상품정보
        </h1>

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
                {formatProductLabel(
                  COMPLETE_SUMMARY.name,
                  COMPLETE_SUMMARY.extraCount,
                )}
              </p>
              <p className="m-0 text-sm leading-6 font-normal text-foreground-muted max-md:text-xs max-md:leading-[18px]">
                {COMPLETE_SUMMARY.categoryLabel}
              </p>
            </div>
          </div>

          <div className="flex w-full items-center justify-between">
            <strong className="text-2xl leading-8 font-bold text-foreground-strong max-md:text-lg max-md:leading-[26px]">
              총 {COMPLETE_SUMMARY.totalCount}개
            </strong>
            <strong className="text-center text-[32px] leading-[42px] font-bold text-accent max-md:text-xl max-md:leading-8">
              {formatPrice(COMPLETE_SUMMARY.totalAmount)}
            </strong>
          </div>

          <hr className="m-0 w-full border-0 border-t border-border" />

          <div className="flex w-full flex-col gap-4">
            <h2 className="m-0 text-xl leading-8 font-semibold text-foreground-strong max-md:text-base max-md:leading-[26px]">
              요청 메시지
            </h2>
            <div className="flex min-h-40 flex-col overflow-hidden rounded-2xl border border-border bg-surface-muted px-6 py-3.5 max-md:px-4">
              {COMPLETE_REQUEST_LINES.map((line) => (
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

        <div className="flex w-full max-w-[640px] items-center justify-between gap-5 max-md:max-w-none max-md:flex-col max-md:gap-3">
          <Link
            href="/cart"
            className={`${buttonBase} bg-snack-background-500 text-accent max-md:order-2`}
          >
            장바구니로 돌아가기
          </Link>
          <Link
            href="/purchase/requests"
            className={`${buttonBase} bg-accent text-surface max-md:order-1`}
          >
            요청 내역 확인하기
          </Link>
        </div>
      </div>
    </main>
  );
}
