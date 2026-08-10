"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { changeCompanyName, changePassword } from "@/api/userApi";
import { queryKeys } from "@/constants/queryKeys";
import type { MyProfile } from "@/types/userTypes";

/**
 * 비밀번호 변경(Mutation).
 * 성공 시 세션이 종료되므로 me 캐시는 무효화합니다.
 */
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      void queryClient.removeQueries({
        queryKey: queryKeys.users.me(),
      });
    },
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
