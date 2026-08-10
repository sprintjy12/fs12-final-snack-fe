import { apiClient } from "@/api/core/apiClient";
import type {
  BudgetSettingsResponse,
  BudgetSummaryResponse,
  UpdateBudgetSettingsBody,
} from "@/types/budgetTypes";

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

/** 예산 설정 조회 (이번 달 예산 / 매달 시작 예산) */
export const getBudgetSettings = async (): Promise<BudgetSettingsResponse> => {
  const response = await apiClient.get<BudgetSettingsResponse>(
    "/api/budgets/settings",
  );

  return response.data;
};

/** 예산 설정 수정 — 변경된 필드만 body에 포함 */
export const updateBudgetSettings = async (
  body: UpdateBudgetSettingsBody,
): Promise<BudgetSettingsResponse> => {
  const response = await apiClient.patch<BudgetSettingsResponse>(
    "/api/budgets/settings",
    body,
  );

  return response.data;
};
