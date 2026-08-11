"use client";

import { useQuery } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { getMyProducts } from "@/api/productApi";
import { queryKeys } from "@/constants/queryKeys";
import type { GetMyProductsParams } from "@/types/productTypes";

/**
 * 내가 등록한 상품 목록.
 * 로그인 페이지 전에는 ensureAccessToken으로 로컬 세션을 맞춘 뒤 조회합니다.
 */
export const useMyProducts = (params: GetMyProductsParams = {}) =>
  useQuery({
    queryKey: queryKeys.products.mine(params),
    queryFn: async () => {
      await ensureAccessToken();
      return getMyProducts(params);
    },
  });
