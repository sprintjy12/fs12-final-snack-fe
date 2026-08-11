"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import {
  addToCart,
  deleteCart,
  deleteCartItem,
  deleteSelectedCartItems,
  updateCartItem,
} from "@/api/cartApi";
import { queryKeys } from "@/constants/queryKeys";
import type {
  AddToCartRequest,
  DeleteSelectedCartRequest,
  UpdateCartItemParams,
} from "@/types/cartTypes";

const invalidateCart = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

/**
 * 장바구니 추가, 수정, 삭제 Mutation.
 * 로그인 페이지 전에는 ensureAccessToken으로 로컬 세션을 맞춘 뒤 조회합니다.
 */

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AddToCartRequest) => {
      await ensureAccessToken();
      return addToCart(request);
    },
    onSuccess: () => invalidateCart(queryClient),
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateCartItemParams) => {
      await ensureAccessToken();
      return updateCartItem(params);
    },
    onSuccess: () => invalidateCart(queryClient),
  });
};

export const useDeleteSelectedCartItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: DeleteSelectedCartRequest) => {
      await ensureAccessToken();
      return deleteSelectedCartItems(request);
    },
    onSuccess: () => invalidateCart(queryClient),
  });
};

export const useDeleteCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartId: string) => {
      await ensureAccessToken();
      return deleteCartItem(cartId);
    },
    onSuccess: () => invalidateCart(queryClient),
  });
};

export const useDeleteCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await ensureAccessToken();
      return deleteCart();
    },
    onSuccess: () => invalidateCart(queryClient),
  });
};
