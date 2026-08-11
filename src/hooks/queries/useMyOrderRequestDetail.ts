"use client";

import { useQuery } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { getMyOrderRequestDetail } from "@/api/orderApi";
import { queryKeys } from "@/constants/queryKeys";

/**
 * 내 구매 요청 상세.
 * 로그인 페이지 전에는 ensureAccessToken으로 로컬 세션을 맞춘 뒤 조회합니다.
 */
export const useMyOrderRequestDetail = (orderId: string) =>
  useQuery({
    queryKey: queryKeys.orders.myRequestDetail(orderId),
    queryFn: async () => {
      await ensureAccessToken();
      return getMyOrderRequestDetail(orderId);
    },
    enabled: Boolean(orderId),
  });
