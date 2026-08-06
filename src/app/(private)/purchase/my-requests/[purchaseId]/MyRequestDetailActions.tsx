"use client";

import { Button } from "@/components/ui";

type MyRequestDetailActionsProps = {
  purchaseId: string;
};

/**
 * 내 구매 요청 상세 하단 CTA — 목록 보기 / 장바구니에 다시 담기.
 */
export function MyRequestDetailActions({
  purchaseId,
}: MyRequestDetailActionsProps) {
  return (
    <div
      className="mt-8 flex w-full gap-3 md:mt-16 md:w-[696px] md:gap-5 xl:mt-6 xl:w-full xl:gap-[23px]"
      data-purchase-id={purchaseId}
    >
      <Button
        href="/purchase/my-requests"
        variant="secondary"
        width="full"
        className="flex-1 text-sm leading-6 xl:text-xl xl:leading-8"
      >
        목록 보기
      </Button>
      <Button
        type="button"
        width="full"
        className="flex-1 text-sm leading-6 xl:text-xl xl:leading-8"
        onClick={() => {
          // TODO: 장바구니에 다시 담기 API 연동
        }}
      >
        장바구니에 다시 담기
      </Button>
    </div>
  );
}
