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

export function readPurchaseRequestComplete(): PurchaseRequestCompleteSummary | null {
  try {
    const raw = sessionStorage.getItem(PURCHASE_REQUEST_COMPLETE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PurchaseRequestCompleteSummary;
    if (!parsed?.name || typeof parsed.totalCount !== "number") return null;
    return parsed;
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
