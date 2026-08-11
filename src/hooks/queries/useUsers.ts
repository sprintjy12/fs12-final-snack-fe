"use client";

import { useQuery } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { getUsers } from "@/api/userApi";
import { queryKeys } from "@/constants/queryKeys";
import type { GetUsersParams } from "@/types/userTypes";

/**
 * 회원 목록.
 * 로그인 페이지 전에는 ensureAccessToken으로 로컬 세션을 맞춘 뒤 조회합니다.
 */
export const useUsers = (params: GetUsersParams = {}) =>
  useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async () => {
      await ensureAccessToken();
      return getUsers(params);
    },
  });
