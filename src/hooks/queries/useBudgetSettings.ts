"use client";

import { useQuery } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { getBudgetSettings } from "@/api/budgetApi";
import { queryKeys } from "@/constants/queryKeys";

/**
 * 예산 설정 조회.
 * 로그인 페이지 전에는 ensureAccessToken으로 로컬 세션을 맞춘 뒤 조회합니다.
 */
export const useBudgetSettings = () =>
  useQuery({
    queryKey: queryKeys.budgets.settings(),
    queryFn: async () => {
      await ensureAccessToken();
      return getBudgetSettings();
    },
  });
