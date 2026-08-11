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

export function readPurchaseRequestComplete(): PurchaseRequestCompleteSummary | null {
  try {
    const raw = sessionStorage.getItem(PURCHASE_REQUEST_COMPLETE_KEY);
    if (!raw) return null;
    const parsed = purchaseRequestCompleteSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function clearPurchaseRequestComplete() {
  try {
    sessionStorage.removeItem(PURCHASE_REQUEST_COMPLETE_KEY);
  } catch {
    // ignore
  }
}
