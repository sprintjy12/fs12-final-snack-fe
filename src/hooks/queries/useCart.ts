"use client";

import { useQuery } from "@tanstack/react-query";
import { ensureAccessToken } from "@/api/authApi";
import { getCart } from "@/api/cartApi";
import { queryKeys } from "@/constants/queryKeys";

// 인증 사용자별 장바구니 캐시를 분리하거나 초기화하세요.

// 인증 주체가 변경되면 ["cart"] 캐시가 이전 사용자와 공유됩니다. staleTime 동안 이전 장바구니가 새 사용자에게 표시될 수 있습니다.
// 사용자 ID를 queryKey에 포함하거나 로그인·로그아웃 시 removeQueries 또는 resetQueries로 캐시를 제거하세요.

export const useCart = () =>
  useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: async () => {
      await ensureAccessToken();
      return getCart();
    },
  });