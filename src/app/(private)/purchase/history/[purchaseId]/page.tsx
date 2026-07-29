import Image from "next/image";

import { Icon } from "@/components/ui";

const purchasedItems = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  category: "청량 ・ 탄산음료",
  name: "코카콜라 제로",
  unitPrice: "2,000원",
  quantity: 4,
  totalPrice: "8,000원",
  discounted: index > 2,
}));

type PurchaseHistoryDetailPageProps = {
  params: Promise<{
    purchaseId: string;
  }>;
};

const PurchaseHistoryDetailPage = async ({
  params,
}: PurchaseHistoryDetailPageProps) => {
  const { purchaseId } = await params;

  return (
    <main
      className="min-h-screen bg-surface-muted pb-20 text-foreground"
      data-purchase-id={purchaseId}
    >
      <section className="border-b border-border px-6 xl:border-0 xl:px-[120px]">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center xl:h-32">
          <h1 className="text-xl leading-8 font-semibold text-foreground-strong md:ml-2.5 xl:text-[32px] xl:leading-[42px]">
            구매 내역 상세
          </h1>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1680px] flex-col md:grid md:max-w-[744px] md:grid-cols-[327px_minmax(0,1fr)] md:gap-[18px] md:pt-6 md:pl-6 xl:max-w-[1680px] xl:grid-cols-[1041px_587px] xl:gap-[52px] xl:pt-0 xl:pl-0">
        <section className="order-1 md:order-2" aria-label="요청 및 승인 정보">
          <div className="flex h-[380px] flex-col px-6 py-6 md:h-[332px] md:py-0 xl:h-[384px] xl:px-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl leading-8 font-semibold text-foreground-strong xl:text-2xl xl:font-bold">
                요청 정보
              </h2>
              <Icon
                name="chevron-up"
                size="sm"
                className="text-snack-gray-400 xl:hidden"
              />
            </div>
            <div className="mt-3 flex flex-1 flex-col gap-3 border-t border-snack-black-100 pt-3 xl:mt-4 xl:gap-4 xl:pt-4">
              <p className="text-sm leading-[26px] text-snack-gray-400 xl:text-xl xl:leading-8">
                2024. 07. 20.
              </p>
              <div>
                <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                  요청인
                </h3>
                <div className="mt-4 flex h-[54px] items-center rounded-2xl border border-border bg-surface-muted px-4 text-sm leading-6 text-foreground-muted xl:h-16 xl:px-6 xl:text-xl xl:leading-8">
                  김스낵
                </div>
              </div>
              <div>
                <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                  요청 메시지
                </h3>
                <div className="mt-4 min-h-[76px] rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm leading-6 text-foreground-muted xl:min-h-20 xl:px-6 xl:py-3.5 xl:text-lg xl:leading-[26px]">
                  <span className="block">코카콜라 제로 인기가 많아요.</span>
                  <span className="block">많이 주문하면 좋을 것 같아요!</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-[356px] flex-col px-6 py-6 md:mt-8 md:h-[308px] md:py-0 xl:mt-4 xl:h-[358px] xl:px-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl leading-8 font-semibold text-foreground-strong xl:text-2xl xl:font-bold">
                승인 정보
              </h2>
              <Icon
                name="chevron-up"
                size="sm"
                className="text-snack-gray-400 xl:hidden"
              />
            </div>
            <div className="mt-3 flex flex-1 flex-col gap-3 border-t border-snack-black-100 pt-3 xl:mt-4 xl:gap-4 xl:pt-4">
              <p className="text-sm leading-[26px] text-snack-gray-400 xl:text-xl xl:leading-8">
                2024. 07. 24.
              </p>
              <div>
                <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                  담당자
                </h3>
                <div className="mt-4 flex h-[54px] items-center rounded-2xl border border-border bg-surface-muted px-4 text-sm leading-6 text-foreground-muted xl:h-16 xl:px-6 xl:text-xl xl:leading-8">
                  김코드
                </div>
              </div>
              <div>
                <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                  승인 메시지
                </h3>
                <div className="mt-4 flex min-h-[52px] items-center rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm leading-6 text-foreground-muted xl:min-h-[54px] xl:px-6 xl:text-lg xl:leading-[26px]">
                  재고가 얼마 남지 않아 주문 승인합니다.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="order-2 px-6 md:order-1 md:px-0"
          aria-label="구매 품목"
        >
          <h2 className="text-xl leading-8 font-semibold text-foreground-strong xl:text-2xl xl:font-bold">
            구매 품목
          </h2>
          <div className="mt-4 h-[480px] overflow-y-auto rounded-2xl border border-snack-black-100 bg-surface p-6 shadow-[4px_4px_20px_rgba(250,247,243,0.25)] [scrollbar-color:var(--snack-gray-400)_transparent] [scrollbar-width:thin] md:h-[612px] xl:mt-6 xl:h-[582px] xl:p-10">
            <ul className="space-y-6">
              {purchasedItems.map((product) => (
                <li
                  key={product.id}
                  className="border-b border-border pb-2 xl:pb-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 xl:gap-4">
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted shadow-[4px_4px_10px_rgba(250,247,243,0.25)] xl:size-20">
                        <Image
                          src="/images/purchase-history-product.png"
                          alt=""
                          width={28}
                          height={49}
                          className="h-[39px] w-[22px] object-contain xl:h-[49px] xl:w-7"
                        />
                      </div>
                      <div>
                        <p className="text-xs leading-[18px] text-foreground-muted xl:text-sm xl:leading-6">
                          {product.category}
                        </p>
                        <p className="text-sm leading-6 font-medium text-foreground-strong xl:text-lg xl:leading-[26px]">
                          {product.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-[78px] flex-col items-end justify-center">
                      {product.discounted ? (
                        <p className="flex gap-1 text-sm leading-5">
                          <span className="text-danger">5%</span>
                          <span className="text-foreground-muted line-through">
                            1,900원
                          </span>
                        </p>
                      ) : null}
                      <p className="text-sm leading-6 font-semibold text-foreground-strong xl:text-lg xl:leading-[26px]">
                        {product.unitPrice}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-foreground-strong xl:mt-4">
                    <p className="text-[13px] leading-[22px] font-medium xl:text-base xl:leading-[26px]">
                      수량: {product.quantity}개
                    </p>
                    <p className="text-lg leading-[26px] font-bold xl:text-2xl xl:leading-8">
                      {product.totalPrice}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex items-center justify-end gap-4 whitespace-nowrap xl:mt-0 xl:py-4">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-2xl xl:leading-8">
              총 24건
            </span>
            <strong className="text-2xl leading-8 text-accent xl:text-[32px] xl:leading-[42px]">
              240,000원
            </strong>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PurchaseHistoryDetailPage;
