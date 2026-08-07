import { apiClient } from "@/api/core/apiClient";
import type { AddToCartBody, AddToCartResponse } from "@/types/cartTypes";

/**
 * 장바구니 담기.
 * 신규 추가 시 201, 이미 담긴 상품이면 200(수량 합산).
 */
export const addToCart = async (
  body: AddToCartBody,
): Promise<AddToCartResponse> => {
  const response = await apiClient.post<AddToCartResponse>("/api/cart", {
    productId: body.productId,
    quantity: body.quantity ?? 1,
  });

  return response.data;
};
