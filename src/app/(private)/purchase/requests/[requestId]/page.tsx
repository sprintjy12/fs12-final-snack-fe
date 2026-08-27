"use client";

import Image from "next/image";
import { useParams } from "next/navigation";

import { PurchaseRequestDecisionActions } from "@/app/(private)/purchase/requests/PurchaseRequestDecisionActions";
import {
  BUDGET_EXCEEDED_MESSAGE,
  isOrderRequestBudgetExceeded,
} from "@/app/(private)/purchase/requests/orderRequestBudget";
import { Icon } from "@/components/ui";
import { useOrderRequestDetail } from "@/hooks/queries/useOrderRequestDetail";

const PLACEHOLDER_IMAGE = "/images/purchase-history-product.png";

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}.`;
};

const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}원`;

const formatCategoryName = (categoryName: string) =>
  categoryName.replace(/>/g, " ・ ");

export default function PurchaseRequestDetailPage() {
  const params = useParams();
  const rawRequestId = params?.requestId;
  const requestId = Array.isArray(rawRequestId)
    ? rawRequestId[0]
    : (rawRequestId ?? "");

  const { data, isPending, isError, error } = useOrderRequestDetail(requestId);
  const detail = data?.data;
  const isBudgetExceeded = detail
    ? isOrderRequestBudgetExceeded(detail)
    : false;

  const budgetRows = detail
    ? [
        {
          label: "이번 달 지출액",
          value: formatPrice(detail.budget.spent),
          emphasize: false,
          danger: false,
        },
        {
          label: "이번 달 남은 예산",
          value: detail.budget.isUnlimited
            ? "미설정"
            : formatPrice(detail.budget.remaining),
          emphasize: false,
          danger: isBudgetExceeded,
        },
        {
          label: "구매 후 예산",
          value: detail.budget.isUnlimited
            ? "미설정"
            : formatPrice(detail.budget.remaining - detail.totalPrice),
          emphasize: true,
          danger: false,
        },
      ]
    : [];

  return (
    <main
      className="min-h-screen bg-surface-muted pb-0 text-foreground md:pb-[30px] xl:pb-0"
      data-request-id={requestId}
    >
      <section className="border-b border-border px-6 xl:border-0 xl:px-[120px]">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center xl:h-32">
          <h1 className="text-xl leading-8 font-semibold text-foreground-strong md:ml-2.5 xl:text-[32px] xl:leading-[42px]">
            구매 요청 상세
          </h1>
        </div>
      </section>

      {isPending ? (
        <p className="px-6 py-16 text-center text-foreground-muted xl:px-0">
          구매 요청을 불러오는 중…
        </p>
      ) : null}

      {isError ? (
        <p className="px-6 py-16 text-center text-snack-state-100 xl:px-0">
          {error instanceof Error
            ? error.message
            : "구매 요청을 불러오지 못했습니다."}
        </p>
      ) : null}

      {!isPending && !isError && detail ? (
        <div className="mx-auto flex max-w-[1680px] flex-col md:grid md:max-w-[744px] md:grid-cols-[327px_minmax(0,1fr)] md:gap-[18px] md:pt-6 md:pl-6 xl:max-w-[1680px] xl:grid-cols-[1041px_587px] xl:gap-[52px] xl:pt-0 xl:pl-0">
          <section className="order-1 md:order-2" aria-label="요청 및 예산 정보">
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
                  {formatDate(detail.requestedAt)}
                </p>
                <div>
                  <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                    요청인
                  </h3>
                  <div className="mt-4 flex h-[54px] items-center rounded-2xl border border-border bg-surface-muted px-4 text-sm leading-6 text-foreground-muted xl:h-16 xl:px-6 xl:text-xl xl:leading-8">
                    {detail.requesterName ?? "-"}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                    요청 메시지
                  </h3>
                  <div className="mt-4 min-h-[76px] rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm leading-6 whitespace-pre-line text-foreground-muted xl:min-h-20 xl:px-6 xl:py-3.5 xl:text-lg xl:leading-[26px]">
                    {detail.requestMessage || "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-[440px] flex-col px-6 py-6 md:min-h-[416px] md:pb-0 xl:mt-4 xl:min-h-[448px] xl:px-0 xl:py-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl leading-8 font-semibold text-foreground-strong xl:text-2xl xl:font-bold">
                  예산 정보
                </h2>
                <Icon
                  name="chevron-up"
                  size="sm"
                  className="text-snack-gray-400 xl:hidden"
                />
              </div>
              <div className="mt-3 flex flex-1 flex-col gap-6 border-t border-snack-black-100 pt-3 xl:mt-4 xl:gap-4 xl:pt-4">
                {budgetRows.map((row) => (
                  <div key={row.label}>
                    <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                      {row.label}
                    </h3>
                    <div
                      className={[
                        "mt-4 flex h-[54px] items-center rounded-2xl border bg-surface-muted px-4 text-sm leading-6 xl:h-16 xl:px-6 xl:text-xl xl:leading-8",
                        row.danger
                          ? "border-danger font-medium text-danger"
                          : [
                              "border-border",
                              row.emphasize
                                ? "font-medium text-snack-black-300"
                                : "text-foreground-muted",
                            ].join(" "),
                      ].join(" ")}
                    >
                      {row.value}
                    </div>
                    {row.label === "이번 달 남은 예산" && row.danger ? (
                      <p className="mt-2 text-base leading-[26px] font-medium text-danger">
                        {BUDGET_EXCEEDED_MESSAGE}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            className="order-2 px-6 md:order-1 md:px-0"
            aria-label="요청 품목"
          >
            <h2 className="text-xl leading-8 font-semibold text-foreground-strong xl:text-2xl xl:font-bold">
              요청 품목
            </h2>
            <div className="mt-4 h-[480px] overflow-y-auto rounded-2xl border border-snack-black-100 bg-surface p-6 shadow-[4px_4px_20px_rgba(250,247,243,0.25)] [scrollbar-color:var(--snack-gray-400)_transparent] [scrollbar-width:thin] md:h-[612px] xl:mt-6 xl:h-[582px] xl:p-10">
              <ul className="space-y-6">
                {detail.items.map((product, index) => (
                  <li
                    key={`${product.productName}-${index}`}
                    className="border-b border-border pb-2 xl:pb-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 xl:gap-4">
                        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted shadow-[4px_4px_10px_rgba(250,247,243,0.25)] xl:size-20">
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

            {detail.status === "PENDING" ? (
              <PurchaseRequestDecisionActions
                requestId={requestId}
                approveDisabled={isBudgetExceeded}
              />
            ) : null}
          </section>
        </div>
      ) : null}
    </main>
  );
}
