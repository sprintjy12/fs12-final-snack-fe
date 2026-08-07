"use client";

import { useQuery } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { getBudgetSummary } from "@/api/budgetApi";
import { queryKeys } from "@/constants/queryKeys";

/**
 * 예산 현황(지출 요약).
 * 로그인 페이지 전에는 ensureAccessToken으로 로컬 세션을 맞춘 뒤 조회합니다.
 */
export const useBudgetSummary = () =>
  useQuery({
    queryKey: queryKeys.budgets.summary(),
    queryFn: async () => {
      await ensureAccessToken();
      return getBudgetSummary();
    },
  });
