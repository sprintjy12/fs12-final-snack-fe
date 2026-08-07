"use client";

import { useQuery } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { getOrderDetail } from "@/api/orderApi";
import { queryKeys } from "@/constants/queryKeys";

/**
 * 구매 내역 상세.
 * 로그인 페이지 전에는 ensureAccessToken으로 로컬 세션을 맞춘 뒤 조회합니다.
 */
export const useOrderDetail = (orderId: string) =>
  useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: async () => {
      await ensureAccessToken();
      return getOrderDetail(orderId);
    },
    enabled: Boolean(orderId),
  });
