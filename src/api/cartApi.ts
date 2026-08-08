import { apiClient } from "@/api/core/apiClient";
import type {
  AddToCartRequest,
  CartItemRecord,
  CartResponse,
  DeleteManyResult,
  DeleteSelectedCartRequest,
  UpdateCartItemParams,
} from "@/types/cartTypes";

type CartApiEnvelope<T> = {
  message: string;
  data: T;
};

/**
 * 장바구니 API.
 * 화면 상태/캐시는 Hook에서 처리합니다.
 */

export const getCart = async (): Promise<CartResponse> => {
  const response = await apiClient.get<CartApiEnvelope<CartResponse>>("/api/cart");

  return response.data.data;
};

export const addToCart = async (
  request: AddToCartRequest,
): Promise<CartItemRecord> => {
  const response = await apiClient.post<CartApiEnvelope<CartItemRecord>>(
    "/api/cart",
    request,
  );

  return response.data.data;
};

export const updateCartItem = async ({
  cartId,
  request,
}: UpdateCartItemParams): Promise<CartItemRecord | null> => {
  const response = await apiClient.patch<CartApiEnvelope<CartItemRecord | null>>(
    `/api/cart/${cartId}`,
    request,
  );

  return response.data.data;
};

export const deleteSelectedCartItems = async (
  request: DeleteSelectedCartRequest,
): Promise<DeleteManyResult> => {
  const response = await apiClient.delete<CartApiEnvelope<DeleteManyResult>>(
    "/api/cart/selected",
    { data: request },
  );

  return response.data.data;
};

export const deleteCartItem = async (cartId: string): Promise<DeleteManyResult> => {
  const response = await apiClient.delete<CartApiEnvelope<DeleteManyResult>>(
    `/api/cart/${cartId}`,
  );

  return response.data.data;
};

export const deleteCart = async (): Promise<DeleteManyResult> => {
  const response = await apiClient.delete<CartApiEnvelope<DeleteManyResult>>(
    "/api/cart",
  );

  return response.data.data;
};

