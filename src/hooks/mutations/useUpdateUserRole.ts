"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { updateUserRole } from "@/api/userApi";
import { queryKeys } from "@/constants/queryKeys";
import type { UpdateUserRolePayload } from "@/types/userTypes";

type UpdateUserRoleVariables = {
  userId: string;
  payload: UpdateUserRolePayload;
};

/**
 * 회원 권한 변경.
 * 성공 후 회원 목록 캐시를 무효화합니다.
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, payload }: UpdateUserRoleVariables) => {
      await ensureAccessToken();
      return updateUserRole(userId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.all,
      });
    },
  });
};
