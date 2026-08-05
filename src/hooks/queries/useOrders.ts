"use client";

import { useQuery } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { getOrders } from "@/api/orderApi";
import { queryKeys } from "@/constants/queryKeys";
import type { GetOrdersParams } from "@/types/orderTypes";

/**
 * 구매 내역 목록.
 * 로그인 페이지 전에는 ensureAccessToken으로 로컬 세션을 맞춘 뒤 조회합니다.
 */
export const useOrders = (params: GetOrdersParams = {}) =>
  useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: async () => {
      await ensureAccessToken();
      return getOrders(params);
    },
  });
