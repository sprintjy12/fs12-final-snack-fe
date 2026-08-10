"use client";

import { useQuery } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { getMyOrderRequests } from "@/api/orderApi";
import { queryKeys } from "@/constants/queryKeys";
import type { GetMyOrderRequestsParams } from "@/types/orderTypes";

/**
 * 내 구매 요청 목록.
 * 로그인 페이지 전에는 ensureAccessToken으로 로컬 세션을 맞춘 뒤 조회합니다.
 */
export const useMyOrderRequests = (params: GetMyOrderRequestsParams = {}) =>
  useQuery({
    queryKey: queryKeys.orders.myRequests(params),
    queryFn: async () => {
      await ensureAccessToken();
      return getMyOrderRequests(params);
    },
  });
