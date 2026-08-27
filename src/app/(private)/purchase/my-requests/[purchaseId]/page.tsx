"use client";

import Image from "next/image";
import { useParams } from "next/navigation";

import { MyRequestDetailActions } from "@/app/(private)/purchase/my-requests/[purchaseId]/MyRequestDetailActions";
import { MyRequestDetailPanels } from "@/app/(private)/purchase/my-requests/[purchaseId]/MyRequestDetailPanels";
import { useMyOrderRequestDetail } from "@/hooks/queries/useMyOrderRequestDetail";

const PLACEHOLDER_IMAGE = "/images/purchase-history-product.png";

const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}원`;

const formatCategoryName = (categoryName: string) =>
  categoryName.replace(/>/g, " ・ ");

export default function MyRequestDetailPage() {
  const params = useParams();
  const rawPurchaseId = params?.purchaseId;
  const purchaseId = Array.isArray(rawPurchaseId)
    ? rawPurchaseId[0]
    : (rawPurchaseId ?? "");

  const { data, isPending, isError, error } =
    useMyOrderRequestDetail(purchaseId);
  const detail = data?.data;

  return (
    <main
      className="min-h-screen bg-surface-muted pb-20 text-foreground md:pb-[30px] xl:pb-[120px]"
      data-purchase-id={purchaseId}
    >
      <section className="border-b border-solid border-border px-6 xl:border-0 xl:px-[120px]">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center xl:h-32">
          <h1 className="text-xl leading-8 font-semibold text-foreground-strong md:ml-2.5 xl:text-[32px] xl:leading-[42px]">
            구매 요청 내역
          </h1>
        </div>
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

      {!isPending && !isError && detail ? (
        <div className="box-border w-full xl:px-[120px]">
          <div className="mx-auto flex w-full max-w-[1680px] flex-col md:grid md:max-w-[744px] md:grid-cols-[327px_minmax(0,1fr)] md:items-start md:gap-[18px] md:overflow-x-visible md:pt-6 md:pl-6 xl:max-w-[1680px] xl:grid-cols-[minmax(0,1041px)_minmax(0,587px)] xl:items-start xl:gap-[52px] xl:pt-0 xl:pl-0">
            <MyRequestDetailPanels detail={detail} />

            <section
              className="order-2 min-w-0 px-6 md:order-1 md:px-0"
              aria-label="요청 품목"
            >
              <h2 className="text-xl leading-8 font-semibold text-foreground-strong xl:text-2xl xl:font-bold">
                요청 품목
              </h2>
              <div className="mt-4 h-[480px] overflow-y-auto rounded-2xl border border-solid border-snack-black-100 bg-surface p-6 shadow-[4px_4px_20px_rgba(250,247,243,0.25)] [scrollbar-color:var(--snack-gray-400)_transparent] [scrollbar-width:thin] md:h-[612px] xl:mt-6 xl:h-[582px] xl:p-10">
                <ul className="space-y-6">
                  {detail.items.map((product, index) => (
                    <li
                      key={`${product.productName}-${index}`}
                      className="border-b border-solid border-border pb-2 xl:pb-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 xl:gap-4">
                          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-solid border-border bg-surface-muted shadow-[4px_4px_10px_rgba(250,247,243,0.25)] xl:size-20">
                            {product.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.imageUrl}
                                alt=""
                                className="size-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.src = PLACEHOLDER_IMAGE;
                                }}
                              />
                            ) : (
                              <Image
                                src={PLACEHOLDER_IMAGE}
                                alt=""
                                width={28}
                                height={49}
                                className="h-[39px] w-[22px] object-contain xl:h-[49px] xl:w-7"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-xs leading-[18px] text-foreground-muted xl:text-sm xl:leading-6">
                              {formatCategoryName(product.categoryName)}
                            </p>
                            <p className="text-sm leading-6 font-medium text-foreground-strong xl:text-lg xl:leading-[26px]">
                              {product.productName}
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
                            {formatPrice(product.unitPrice)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-foreground-strong xl:mt-4">
                        <p className="text-[13px] leading-[22px] font-medium xl:text-base xl:leading-[26px]">
                          수량: {product.quantity}개
                        </p>
                        <p className="text-lg leading-[26px] font-bold xl:text-2xl xl:leading-8">
                          {formatPrice(product.subtotal)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center justify-end gap-4 whitespace-nowrap xl:mt-0 xl:py-4">
                <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-2xl xl:leading-8">
                  총 {detail.itemCount}건
                </span>
                <strong className="text-2xl leading-8 text-accent xl:text-[32px] xl:leading-[42px]">
                  {formatPrice(detail.totalPrice)}
                </strong>
              </div>

              <MyRequestDetailActions
                purchaseId={purchaseId}
                items={detail.items}
              />
            </section>
          </div>
        </div>
      ) : null}
    </main>
  );
}
