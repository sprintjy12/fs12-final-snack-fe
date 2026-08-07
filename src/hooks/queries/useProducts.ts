"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";
import { getCategories, getProduct, getProducts } from "@/services/productApi";
import type { ProductListParams } from "@/types/productTypes";

function parseRouteId(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(raw) ? raw : undefined;
}

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getProducts(params),
  });
}

export function useProduct(id: string | undefined) {
  const productId = parseRouteId(id);   // ← 함수 안으로 이동

  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => getProduct(productId as string),
    enabled: productId !== undefined,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  });
}