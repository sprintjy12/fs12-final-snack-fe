"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { approveOrder, rejectOrder } from "@/api/orderApi";
import { queryKeys } from "@/constants/queryKeys";

type ProcessOrderRequestMode = "approve" | "reject";

type ProcessOrderRequestParams = {
  orderId: string;
  mode: ProcessOrderRequestMode;
  responseMessage: string;
};

/**
 * 구매 요청 승인/반려.
 * 성공 후 주문·요청 관련 캐시를 무효화합니다.
 */
export const useProcessOrderRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      mode,
      responseMessage,
    }: ProcessOrderRequestParams) =>
      mode === "approve"
        ? approveOrder(orderId, { responseMessage })
        : rejectOrder(orderId, { responseMessage }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all,
      }),
  });
};
