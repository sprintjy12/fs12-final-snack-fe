"use client";

import { useQuery } from "@tanstack/react-query";

import type { CategoryMenuItem } from "@/constants/categoryConstants";
import { queryKeys } from "@/constants/queryKeys";
import { parseRouteId } from "@/lib/parseOptionalId";
import { getCategories, getProduct, getProducts } from "@/services/productApi";
import type { ProductListParams } from "@/types/productTypes";

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getProducts(params),
  });
}

export function useProduct(id: string | undefined) {
  const productId = parseRouteId(id);

  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => getProduct(productId as string | number),
    enabled: productId !== undefined,
  });
}

export function useCategories() {
  return useQuery<CategoryMenuItem[]>({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}
