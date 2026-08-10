"use client";

import { useQuery } from "@tanstack/react-query";

import type { CategoryMenuItem } from "@/constants/categoryConstants";
import { queryKeys } from "@/constants/queryKeys";
import { getCategories, getProduct, getProducts } from "@/services/productApi";
import type { ProductListParams } from "@/types/productTypes";

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getProducts(params),
  });
}

export function useProduct(id: number | string) {
  const enabled =
    typeof id === "number"
      ? Number.isFinite(id) && id > 0
      : typeof id === "string" && id.length > 0;

  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    enabled,
  });
}

export function useCategories() {
  return useQuery<CategoryMenuItem[]>({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}
