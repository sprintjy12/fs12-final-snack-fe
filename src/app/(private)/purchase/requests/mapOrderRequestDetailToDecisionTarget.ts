import type { PurchaseRequestDecisionTarget } from "@/app/(private)/purchase/requests/PurchaseRequestDecisionModal";
import { isOrderRequestBudgetExceeded } from "@/app/(private)/purchase/requests/orderRequestBudget";
import type { OrderRequestDetailData } from "@/types/orderTypes";

const formatWon = (price: number) => `${price.toLocaleString("ko-KR")}원`;

const formatCategoryName = (categoryName: string) =>
  categoryName.replace(/>/g, " ・ ");

/** 구매 요청 상세 API → 승인/반려 모달 표시용 */
export const mapOrderRequestDetailToDecisionTarget = (
  detail: OrderRequestDetailData,
): PurchaseRequestDecisionTarget => ({
  id: detail.orderId,
  requester: detail.requesterName ?? "-",
  itemCount: detail.itemCount,
  totalAmount: formatWon(detail.totalPrice),
  remainingBudget: detail.budget.isUnlimited
    ? "미설정"
    : formatWon(detail.budget.remaining),
  isBudgetExceeded: isOrderRequestBudgetExceeded(detail),
  items: detail.items.map((item, index) => ({
    id: index + 1,
    category: formatCategoryName(item.categoryName),
    name: item.productName,
    unitPrice: formatWon(item.unitPrice),
    quantity: item.quantity,
    totalPrice: formatWon(item.subtotal),
    imageSrc: item.imageUrl || undefined,
  })),
});
