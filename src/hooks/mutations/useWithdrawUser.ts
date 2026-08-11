"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { withdrawUser } from "@/api/userApi";
import { queryKeys } from "@/constants/queryKeys";

/**
 * 회원 강제 탈퇴.
 * 성공 후 회원 목록 캐시를 무효화합니다.
 */
export const useWithdrawUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await ensureAccessToken();
      return withdrawUser(userId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.all,
      });
    },
  });
};
