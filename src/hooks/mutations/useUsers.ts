"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { changeCompanyName, changePassword } from "@/api/userApi";
import { queryKeys } from "@/constants/queryKeys";
import type { MyProfile } from "@/types/userTypes";

/**
 * 비밀번호 변경(Mutation).
 * me 캐시 제거는 호출부(logout/redirect)에서 처리합니다.
 * 성공 직후 제거하면 ProfilePage UI가 redirect 전에 비게 됩니다.
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};

/**
 * 회사명 변경(Mutation) — SUPER_ADMIN.
 * 성공 시 me 캐시의 company.name을 갱신합니다.
 */
export const useChangeCompanyName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeCompanyName,
    onSuccess: (company) => {
      queryClient.setQueryData(
        queryKeys.users.me(),
        (previous: MyProfile | undefined) =>
          previous
            ? {
                ...previous,
                company: { ...previous.company, name: company.name },
              }
            : previous,
      );
    },
  });
};
