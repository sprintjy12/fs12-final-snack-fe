/** 구매 요청 완료 화면용 sessionStorage 키 */
export const PURCHASE_REQUEST_COMPLETE_KEY = "snack.purchaseRequestComplete";

export type PurchaseRequestCompleteSummary = {
  name: string;
  extraCount: number;
  totalCount: number;
  totalAmount: number;
  categoryLabel: string;
  photo: string;
  requestMessage: string;
  orderId: string | null;
};

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

import { z } from "zod";

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

export function clearPurchaseRequestComplete() {
  try {
    sessionStorage.removeItem(PURCHASE_REQUEST_COMPLETE_KEY);
  } catch {
    // ignore
  }
}
