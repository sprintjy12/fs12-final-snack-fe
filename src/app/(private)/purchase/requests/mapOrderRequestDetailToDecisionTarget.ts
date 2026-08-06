/**
 * 구매 요청 상세(OrderRequestDetailData) 객체를
 * 승인/반려 모달(PurchaseRequestDecisionModal)에서 사용하는 표시 전용 객체(PurchaseRequestDecisionTarget)로 변환하는 함수입니다.
 *
 * 주요 변환 내용:
 * - id: 주문 ID 그대로 사용
 * - requester: 요청자 이름 없으면 '-'로 대체
 * - itemCount: 품목 수
 * - totalAmount: 총 주문 금액(천단위로 ',' 및 '원'포함한 문자열)
 * - remainingBudget: 예산이 무제한이면 '미설정', 아니면 남은금액 형식화(통화표기)
 * - items: 각 품목별 정보 가공 배열
 *   - id: 품목 순번(1부터 시작)
 *   - category: 카테고리 문자열을 '>' 대신 ' ・ '로 표시
 *   - name: 상품명
 *   - unitPrice: 단가(통화표기)
 *   - quantity: 수량
 *   - totalPrice: 소계(통화표기)
 *   - imageSrc: 상품 이미지(없으면 undefined)
 */
import type { PurchaseRequestDecisionTarget } from "@/app/(private)/purchase/requests/PurchaseRequestDecisionModal";
import type { OrderRequestDetailData } from "@/types/orderTypes";

// 숫자를 '1,000원'처럼 한국 통화 표기로 변환
const formatWon = (price: number) => `${price.toLocaleString("ko-KR")}원`;

// 카테고리 구분자 '>'를 ' ・ '로 치환
const formatCategoryName = (categoryName: string) =>
  categoryName.replace(/>/g, " ・ ");

export const mapOrderRequestDetailToDecisionTarget = (
  detail: OrderRequestDetailData,
): PurchaseRequestDecisionTarget => ({
  id: detail.orderId,
  requester: detail.requesterName ?? "-",
  itemCount: detail.itemCount,
  totalAmount: formatWon(detail.totalPrice),
  // 예산이 무제한이면 '미설정', 아니면 남은 예산을 통화표기로 반환
  remainingBudget: detail.budget.isUnlimited
    ? "미설정"
    : formatWon(detail.budget.remaining),
  items: detail.items.map((item, index) => ({
    id: index + 1, // 1-based 품목 순번
    category: formatCategoryName(item.categoryName),
    name: item.productName,
    unitPrice: formatWon(item.unitPrice),
    quantity: item.quantity,
    totalPrice: formatWon(item.subtotal),
    imageSrc: item.imageUrl || undefined,
  })),
});
