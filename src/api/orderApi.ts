import { apiClient } from "@/api/core/apiClient";
import type {
  CreatePurchaseRequestBody,
  CreatePurchaseRequestResponse,
  GetMyOrderRequestsParams,
  GetOrderRequestsParams,
  GetOrdersParams,
  MyOrderRequestDetailResponse,
  MyOrderRequestListResponse,
  OrderDetailResponse,
  OrderListResponse,
  OrderRequestDetailResponse,
  OrderRequestListResponse,
  ProcessOrderRequestBody,
  ProcessOrderResponse,
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

/** 내 구매 요청 목록 */
export const getMyOrderRequests = async (
  params: GetMyOrderRequestsParams = {},
): Promise<MyOrderRequestListResponse> => {
  const response = await apiClient.get<MyOrderRequestListResponse>(
    "/api/orders/my-requests",
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        sort: params.sort ?? "latest",
      },
    },
  );

  return response.data;
};

/** 내 구매 요청 상세 */
export const getMyOrderRequestDetail = async (
  orderId: string,
): Promise<MyOrderRequestDetailResponse> => {
  const response = await apiClient.get<MyOrderRequestDetailResponse>(
    `/api/orders/my-requests/${orderId}`,
  );

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

/** 구매 요청 관리 목록 */
export const getOrderRequests = async (
  params: GetOrderRequestsParams = {},
): Promise<OrderRequestListResponse> => {
  const response = await apiClient.get<OrderRequestListResponse>(
    "/api/orders/requests",
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        sort: params.sort ?? "latest",
      },
    },
  );

  return response.data;
};

/** 구매 요청 상세 */
export const getOrderRequestDetail = async (
  orderId: string,
): Promise<OrderRequestDetailResponse> => {
  const response = await apiClient.get<OrderRequestDetailResponse>(
    `/api/orders/requests/${orderId}`,
  );

  return response.data;
};

/** 장바구니 선택 품목으로 구매 요청 생성 */
export const createPurchaseRequest = async (
  body: CreatePurchaseRequestBody,
): Promise<CreatePurchaseRequestResponse> => {
  const response = await apiClient.post<CreatePurchaseRequestResponse>(
    "/api/orders/requests",
    body,
  );

  return response.data;
};

/** 구매 요청 승인 */
export const approveOrder = async (
  orderId: string,
  body: ProcessOrderRequestBody,
): Promise<ProcessOrderResponse> => {
  const response = await apiClient.patch<ProcessOrderResponse>(
    `/api/orders/${orderId}/approve`,
    body,
  );

  return response.data;
};

/** 구매 요청 반려 */
export const rejectOrder = async (
  orderId: string,
  body: ProcessOrderRequestBody,
): Promise<ProcessOrderResponse> => {
  const response = await apiClient.patch<ProcessOrderResponse>(
    `/api/orders/${orderId}/reject`,
    body,
  );

  return response.data;
};

/** 내 구매 요청 취소 */
export const cancelOrderRequest = async (
  orderId: string,
): Promise<ProcessOrderResponse> => {
  const response = await apiClient.patch<ProcessOrderResponse>(
    `/api/orders/requests/${orderId}/cancel`,
  );

  return response.data;
};
