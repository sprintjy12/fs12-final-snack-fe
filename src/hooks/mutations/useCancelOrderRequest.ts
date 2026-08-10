"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelOrderRequest } from "@/api/orderApi";
import { queryKeys } from "@/constants/queryKeys";

/**
 * 내 구매 요청 취소.
 */
export const useCancelOrderRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => cancelOrderRequest(orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all,
      });
    },
  });
};
