"use client";

// ===해당부분 현재 수정===
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { restoreUser } from "@/api/userApi";
import { queryKeys } from "@/constants/queryKeys";

/**
 * 회원 복구.
 * 성공 후 회원 목록 캐시를 무효화합니다.
 */
export const useRestoreUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await ensureAccessToken();
      return restoreUser(userId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.all,
      });
    },
  });
};
// ==================
