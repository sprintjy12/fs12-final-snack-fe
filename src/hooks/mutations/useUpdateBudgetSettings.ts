"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { updateBudgetSettings } from "@/api/budgetApi";
import { queryKeys } from "@/constants/queryKeys";
import type { UpdateBudgetSettingsBody } from "@/types/budgetTypes";

/**
 * 예산 설정 수정.
 * 성공 후 예산 관련 캐시를 무효화합니다.
 */
export const useUpdateBudgetSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateBudgetSettingsBody) => {
      await ensureAccessToken();
      return updateBudgetSettings(body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.all,
      });
    },
  });
};
