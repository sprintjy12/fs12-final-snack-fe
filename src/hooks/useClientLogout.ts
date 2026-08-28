"use client";

import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { logout } from "@/api/authApi";
import { invalidateAuthSession } from "@/api/core/refreshAccessToken";
import { queryKeys } from "@/constants/queryKeys";
import { clearAccessToken } from "@/lib/authStorage";

/**
 * 인증 사용자(또는 그 회사 세션)에 종속된 Query root.
 * 공용/정적: categories, products.list/detail, posts 는 제외.
 * products.mine 만 사용자별이므로 ["products","mine"] prefix로 제거.
 */
const AUTH_USER_QUERY_ROOTS = [
  queryKeys.users.all,
  queryKeys.cart.all,
  queryKeys.orders.all,
  queryKeys.budgets.all,
  ["products", "mine"] as const,
] as const;

/** in-flight 요청이 늦게 성공해도 캐시를 다시 채우지 않도록 취소 */
export const cancelAuthUserQueries = async (queryClient: QueryClient) => {
  await Promise.all(
    AUTH_USER_QUERY_ROOTS.map((queryKey) =>
      queryClient.cancelQueries({ queryKey }),
    ),
  );
};

export const removeAuthUserQueries = (queryClient: QueryClient) => {
  for (const queryKey of AUTH_USER_QUERY_ROOTS) {
    queryClient.removeQueries({ queryKey });
  }
};

/**
 * 인증 사용자 의존 Query: cancel 후 remove.
 * 로그인 전환 / 로그아웃 / 401 세션 종료 시 사용.
 */
export const clearAuthUserQueries = async (queryClient: QueryClient) => {
  await cancelAuthUserQueries(queryClient);
  removeAuthUserQueries(queryClient);
};

/**
 * access token + 인증 사용자 캐시 정리 (logout API 호출 없음).
 * 순서: in-flight refresh 취소 → cancel → token 제거 → remove
 */
export const clearClientSession = async (queryClient: QueryClient) => {
  invalidateAuthSession();
  await cancelAuthUserQueries(queryClient);
  clearAccessToken();
  removeAuthUserQueries(queryClient);
};

/**
 * 클라이언트 로그아웃.
 * 순서: in-flight refresh 취소 → cancel queries → logout API(토큰 정리) → remove
 */
export const performClientLogout = async (queryClient: QueryClient) => {
  invalidateAuthSession();
  await cancelAuthUserQueries(queryClient);

  try {
    await logout();
  } catch {
    clearAccessToken();
  } finally {
    clearAccessToken();
    removeAuthUserQueries(queryClient);
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
