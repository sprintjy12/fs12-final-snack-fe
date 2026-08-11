"use client";

import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { logout } from "@/api/authApi";
import { queryKeys } from "@/constants/queryKeys";
import { clearAccessToken } from "@/lib/authStorage";

/**
 * 인증 사용자에 종속된 React Query 캐시 제거.
 * users/me · cart — 로그인 전환 / 로그아웃 / 401 세션 종료 시 공통 사용.
 */
export const clearAuthUserQueries = (queryClient: QueryClient) => {
  void queryClient.removeQueries({ queryKey: queryKeys.users.me() });
  void queryClient.removeQueries({ queryKey: queryKeys.cart.all });
};

/**
 * access token + 인증 사용자 캐시 정리 (logout API 호출 없음).
 * RouteGuard 401 등 이미 세션이 무효일 때 사용.
 */
export const clearClientSession = (queryClient: QueryClient) => {
  clearAccessToken();
  clearAuthUserQueries(queryClient);
};

/**
 * 클라이언트 로그아웃 공통 처리.
 * logout API는 refresh 쿠키 정리를 위해 호출하고,
 * 성공/실패와 무관하게 로컬 토큰·me·cart 캐시를 비웁니다.
 */
export const performClientLogout = async (queryClient: QueryClient) => {
  try {
    await logout();
  } catch {
    // authApi.logout이 이미 삼키지만, 호출부 안전망
    clearAccessToken();
  } finally {
    clearAccessToken();
    clearAuthUserQueries(queryClient);
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
