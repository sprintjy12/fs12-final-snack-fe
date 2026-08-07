"use client";

import { useQuery } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { getOrderRequests } from "@/api/orderApi";
import { queryKeys } from "@/constants/queryKeys";
import type { GetOrderRequestsParams } from "@/types/orderTypes";

/**
 * 구매 요청 관리 목록.
 * 로그인 페이지 전에는 ensureAccessToken으로 로컬 세션을 맞춘 뒤 조회합니다.
 */
export const useOrderRequests = (params: GetOrderRequestsParams = {}) =>
  useQuery({
    queryKey: queryKeys.orders.requests(params),
    queryFn: async () => {
      await ensureAccessToken();
      return getOrderRequests(params);
    },
  });
