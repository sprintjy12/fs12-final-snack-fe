"use client";

import { useQuery } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { getMonthlyBudgetSummary } from "@/api/budgetApi";
import { queryKeys } from "@/constants/queryKeys";

export const useMonthlyBudgetSummary = (yearMonth: string) =>
  useQuery({
    queryKey: queryKeys.budgets.monthlySummary(yearMonth),
    queryFn: async () => {
      await ensureAccessToken();
      return getMonthlyBudgetSummary(yearMonth);
    },
    enabled: /^\d{4}-(0[1-9]|1[0-2])$/.test(yearMonth),
  });
