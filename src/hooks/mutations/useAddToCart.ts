"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { addToCart } from "@/api/cartApi";
import { queryKeys } from "@/constants/queryKeys";
import type { AddToCartBody } from "@/types/cartTypes";

/**
 * 장바구니 담기 (단건).
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: AddToCartBody) => {
      await ensureAccessToken();
      return addToCart(body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.cart.all,
      });
    },
  });
};

export type AddCartItemsPayload = {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

/**
 * 여러 상품을 장바구니에 담습니다. (내 구매 요청 다시 담기용)
 */
export const useAddCartItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ items }: AddCartItemsPayload) => {
      await ensureAccessToken();

      const results = await Promise.allSettled(
        items.map((item) =>
          addToCart({
            productId: item.productId,
            quantity: item.quantity,
          }),
        ),
      );

      const failedCount = results.filter(
        (result) => result.status === "rejected",
      ).length;
      const successCount = results.length - failedCount;

      if (successCount === 0) {
        throw new Error("장바구니에 담지 못했습니다.");
      }

      return { successCount, failedCount, totalCount: results.length };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.cart.all,
      });
    },
  });
};
