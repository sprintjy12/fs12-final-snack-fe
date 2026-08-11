"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { logout } from "@/api/authApi";
import { queryKeys } from "@/constants/queryKeys";
import { clearAccessToken } from "@/lib/authStorage";

/**
 * 클라이언트 로그아웃 공통 처리.
 * logout API는 refresh 쿠키 정리를 위해 호출하고,
 * 성공/실패와 무관하게 로컬 토큰·me 캐시를 비웁니다.
 */
export const performClientLogout = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  try {
    await logout();
  } catch {
    // authApi.logout이 이미 삼키지만, 호출부 안전망
    clearAccessToken();
  } finally {
    clearAccessToken();
    void queryClient.removeQueries({ queryKey: queryKeys.users.me() });
    void queryClient.removeQueries({ queryKey: queryKeys.cart.all });
  }
};

/** Header / Profile 등에서 쓰는 로그아웃 + /login 이동 */
export const useClientLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useCallback(async () => {
    await performClientLogout(queryClient);
    router.replace("/login");
  }, [queryClient, router]);
};
