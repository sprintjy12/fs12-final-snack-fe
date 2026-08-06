import type { PurchaseRequestDecisionTarget } from "@/app/(private)/purchase/requests/PurchaseRequestDecisionModal";

/** API 연동 전 모달 품목 샘플 (시안과 동일 구성) */
const MOCK_DECISION_ITEMS = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  category: "청량 ・ 탄산음료",
  name: "코카콜라 제로",
  unitPrice: "2,000원",
  quantity: 4,
  totalPrice: "8,000원",
}));

export function createMockDecisionTarget(input: {
  id: string;
  requester: string;
}): PurchaseRequestDecisionTarget {
  return {
    id: input.id,
    requester: input.requester,
    itemCount: 12,
    totalAmount: "43,000원",
    remainingBudget: "60,000원",
    items: MOCK_DECISION_ITEMS,
  };
}
