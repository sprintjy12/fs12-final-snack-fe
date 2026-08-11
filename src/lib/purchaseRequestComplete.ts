import { z } from "zod";

/** 구매 요청 완료 화면용 sessionStorage 키 */
export const PURCHASE_REQUEST_COMPLETE_KEY = "snack.purchaseRequestComplete";

const purchaseRequestCompleteSchema = z.object({
  name: z.string(),
  extraCount: z.number(),
  totalCount: z.number(),
  totalAmount: z.number(),
  categoryLabel: z.string(),
  photo: z.string(),
  requestMessage: z.string(),
  orderId: z.string().nullable(),
});

export type PurchaseRequestCompleteSummary = z.infer<
  typeof purchaseRequestCompleteSchema
>;

/** 완료 요약 정보를 sessionStorage에 저장 */
export function savePurchaseRequestComplete(
  summary: PurchaseRequestCompleteSummary,
) {
  try {
    sessionStorage.setItem(
      PURCHASE_REQUEST_COMPLETE_KEY,
      JSON.stringify(summary),
    );
  } catch {
    // private mode 등 — 완료 페이지는 mock으로 폴백
  }
}

/**
 * sessionStorage에서 완료 요약 정보를 읽어와 zod로 검증.
 * 값이 없거나 형식이 깨져 있으면 null 반환 (완료 페이지는 mock으로 폴백).
 */
export function getPurchaseRequestComplete(): PurchaseRequestCompleteSummary | null {
  try {
    const raw = sessionStorage.getItem(PURCHASE_REQUEST_COMPLETE_KEY);
    if (!raw) return null;

    const parsed = purchaseRequestCompleteSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** 완료 요약 정보를 sessionStorage에서 제거 */
export function clearPurchaseRequestComplete() {
  try {
    sessionStorage.removeItem(PURCHASE_REQUEST_COMPLETE_KEY);
  } catch {
    // ignore
  }
}
