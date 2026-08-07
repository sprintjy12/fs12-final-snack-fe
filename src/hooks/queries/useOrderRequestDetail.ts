"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { getOrderRequestDetail } from "@/api/orderApi";
import { queryKeys } from "@/constants/queryKeys";

/**
 * 구매 요청 상세.
 * 로그인 페이지 전에는 ensureAccessToken으로 로컬 세션을 맞춘 뒤 조회합니다.
 */
export const useOrderRequestDetail = (orderId: string) =>
  useQuery({
    queryKey: queryKeys.orders.requestDetail(orderId),
    queryFn: async () => {
      await ensureAccessToken();
      return getOrderRequestDetail(orderId);
    },
    enabled: Boolean(orderId),
  });

/** 승인/반려 모달 오픈 시 상세를 즉시 조회합니다. */
export const useFetchOrderRequestDetail = () => {
  const queryClient = useQueryClient();

  return async (orderId: string) => {
    await ensureAccessToken();
    return queryClient.fetchQuery({
      queryKey: queryKeys.orders.requestDetail(orderId),
      queryFn: () => getOrderRequestDetail(orderId),
    });
  };
};
