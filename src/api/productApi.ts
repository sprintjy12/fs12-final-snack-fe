import { apiClient } from "@/api/core/apiClient";
import { findCategoryMenuItem } from "@/constants/categoryConstants";
import { ensureCategoryMenu } from "@/services/productApi";
import type {
  GetMyProductsParams,
  MyProductListItem,
  MyProductListResponse,
} from "@/types/productTypes";

/**
 * 상품 API.
 * 화면 상태/캐시는 Hook에서 처리합니다.
 */

/** 목록 category에 parent가 없으면 parentId로 상위 이름을 채웁니다. */
const withCategoryParent = (
  product: MyProductListItem,
): MyProductListItem => {
  const category = product.category;
  if (!category) {
    return product;
  }

  if (category.parent?.name) {
    return product;
  }

  const parentId = category.parentId;
  if (!parentId) {
    return product;
  }

  const parentName = findCategoryMenuItem(parentId)?.name;
  if (!parentName) {
    return product;
  }

  return {
    ...product,
    category: {
      ...category,
      parent: {
        id: String(parentId),
        name: parentName,
      },
    },
  };
};

/** 내가 등록한 상품 목록 — GET /api/products/me */
export const getMyProducts = async (
  params: GetMyProductsParams = {},
): Promise<MyProductListResponse> => {
  const response = await apiClient.get<MyProductListResponse>(
    "/api/products/me",
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 8,
        sort: params.sort ?? "latest",
      },
    },
  );

  // 상위 카테고리명 조회용 (목록 응답에는 parent 객체가 없을 수 있음)
  await ensureCategoryMenu().catch(() => undefined);

  return {
    ...response.data,
    data: (response.data.data ?? []).map(withCategoryParent),
  };
};
