import { apiClient } from "@/api/core/apiClient";
import type { BudgetSummaryResponse } from "@/types/budgetTypes";

/**
 * 예산 현황(지출 요약) API.
 * 화면 상태/캐시는 Hook에서 처리합니다.
 */
export const getBudgetSummary = async (): Promise<BudgetSummaryResponse> => {
  const response = await apiClient.get<BudgetSummaryResponse>(
    "/api/budgets/summary",
  );

  return response.data;
};
