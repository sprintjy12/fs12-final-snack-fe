"use client";

import { useQuery } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { getCart } from "@/api/cartApi";
import { queryKeys } from "@/constants/queryKeys";
import { getAccessToken } from "@/lib/authStorage";

/**
 * 장바구니 조회.
 * queryKey는 공용(["cart"])이므로 사용자 전환 시
 * clearAuthUserQueries(cancel→remove)로 캐시를 제거합니다.
 */
export const useCart = () => {
  const hasToken = Boolean(getAccessToken());

  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: async () => {
      await ensureAccessToken();
      return getCart();
    },
    enabled: hasToken,
  });
};
