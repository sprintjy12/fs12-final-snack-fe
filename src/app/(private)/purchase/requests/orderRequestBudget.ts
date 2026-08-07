import type { OrderRequestDetailData } from "@/types/orderTypes";

/** 주문 금액이 이번 달 남은 예산을 초과하는지 여부 */
export const isOrderRequestBudgetExceeded = (
  detail: Pick<OrderRequestDetailData, "totalPrice" | "budget">,
) => {
  if (detail.budget.isUnlimited) {
    return false;
  }
  return detail.totalPrice > detail.budget.remaining;
};

export const BUDGET_EXCEEDED_MESSAGE = "구매 금액이 남은 예산을 초과합니다.";
