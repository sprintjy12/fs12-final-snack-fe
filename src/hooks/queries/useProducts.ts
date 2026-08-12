"use client";

import { useQuery } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import type { CategoryMenuItem } from "@/constants/categoryConstants";
import { queryKeys } from "@/constants/queryKeys";
import { getCategories, getProduct, getProducts } from "@/api/productApi";
import type { ProductListParams } from "@/types/productTypes";

function parseRouteId(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(raw) ? raw : undefined;
}

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: async () => {
      await ensureAccessToken();
      return getProducts(params);
    },
  });
}

export function useProduct(id: string | undefined) {
  const productId = parseRouteId(id);

  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: async () => {
      await ensureAccessToken();
      return getProduct(productId as string);
    },
    enabled: productId !== undefined,
  });
}

export function useCategories() {
  return useQuery<CategoryMenuItem[]>({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      await ensureAccessToken();
      return getCategories();
    },
    staleTime: 5 * 60 * 1000,
  });
}
