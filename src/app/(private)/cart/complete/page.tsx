import Image from "next/image";
import { Button } from "@/components/ui";

/** 장바구니 구매 완료 — UI 시안용 더미 (API 연동 전) */
const purchaseSummary = {
  productName: "코카콜라 제로 외 8개",
  category: "청량 ・탄산음료",
  totalQuantity: 9,
  totalPrice: "43,000원",
  imageSrc: "/images/purchase-history-product.png",
} as const;

export default function CartPurchaseCompletePage() {
  return (
    <main className="flex min-h-screen flex-col bg-surface-muted text-foreground">
      <section className="flex flex-col items-center gap-2 px-6 pt-10 md:pt-10 md:pb-4 xl:pt-[120px] xl:pb-10">
        <h1 className="text-xl leading-8 font-semibold text-foreground-strong md:px-2.5 md:py-3.5 md:text-[32px] md:leading-[42px]">
          구매 완료
        </h1>
        <p className="text-center text-sm leading-6 font-normal text-snack-gray-400 md:text-xl md:leading-8">
          성공적으로 구매가 완료되었습니다.
        </p>
      </section>

      <section
        aria-label="구매 상품 정보"
        className="mx-auto flex w-full max-w-[375px] flex-col gap-8 px-6 pt-8 pb-10 md:max-w-none md:gap-8 md:px-6 xl:max-w-[688px] xl:px-6"
      >
        <div className="flex w-full flex-col gap-8">
          <h2 className="text-lg leading-[26px] font-semibold text-foreground-strong md:text-2xl md:leading-8">
            상품정보
          </h2>

          <div className="flex w-full flex-col gap-4 border-y-2 border-border py-6 md:gap-8 md:p-8">
            <div className="flex items-start gap-6">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted shadow-[4px_4px_10px_rgba(250,247,243,0.25)] md:size-[120px]">
                <Image
                  src={purchaseSummary.imageSrc}
                  alt=""
                  width={94}
                  height={164}
                  className="h-[39px] w-[22px] object-contain md:h-[82px] md:w-[47px]"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 self-stretch justify-center">
                <p className="text-sm leading-6 font-medium text-foreground-strong md:text-lg md:leading-[26px]">
                  {purchaseSummary.productName}
                </p>
                <p className="text-xs leading-[18px] text-snack-gray-500 md:text-sm md:leading-6">
                  {purchaseSummary.category}
                </p>
              </div>
            </div>

            <div className="flex w-full items-center justify-between">
              <p className="text-lg leading-[26px] font-bold text-foreground-strong md:text-2xl md:leading-8">
                총 {purchaseSummary.totalQuantity}개
              </p>
              <p className="text-xl leading-8 font-bold text-accent md:text-[32px] md:leading-[42px]">
                {purchaseSummary.totalPrice}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full flex-col-reverse gap-3 md:w-[640px] md:flex-row md:justify-between md:gap-5">
          <Button
            variant="secondary"
            href="/cart"
            className="w-full md:h-16 md:w-[310px] md:flex-none md:text-xl md:leading-8 xl:w-[310px]"
          >
            장바구니로 돌아가기
          </Button>
          <Button
            href="/purchase/history"
            className="w-full md:h-16 md:w-[310px] md:flex-none md:text-xl md:leading-8 xl:w-[310px]"
          >
            구매 내역 확인하기
          </Button>
        </div>
      </section>
    </main>
  );
}
