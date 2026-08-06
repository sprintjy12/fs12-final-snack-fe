import { apiClient } from "@/api/core/apiClient";
import type {
  GetOrdersParams,
  OrderDetailResponse,
  OrderListResponse,
} from "@/types/orderTypes";

/**
 * 구매 내역(주문) API.
 * 화면 상태/캐시는 Hook에서 처리합니다.
 */
export const getOrders = async (
  params: GetOrdersParams = {},
): Promise<OrderListResponse> => {
  const response = await apiClient.get<OrderListResponse>("/api/orders", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      sort: params.sort ?? "latest",
    },
  });

  return response.data;
};

/** 구매 내역 상세 (DIRECT / REQUEST 공통) */
export const getOrderDetail = async (
  orderId: string,
): Promise<OrderDetailResponse> => {
  const response = await apiClient.get<OrderDetailResponse>(
    `/api/orders/${orderId}`,
  );

  return response.data;
};
