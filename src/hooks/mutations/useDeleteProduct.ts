"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { deleteProduct } from "@/api/productApi";
import { queryKeys } from "@/constants/queryKeys";

/**
 * 상품 삭제.
 * 성공 후 상품 목록/내 상품 캐시를 무효화합니다.
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      await ensureAccessToken();
      return deleteProduct(productId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.all,
      });
    },
  });
};
