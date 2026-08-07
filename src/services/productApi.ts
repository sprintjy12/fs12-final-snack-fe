import {
  TEMP_CATEGORIES,
  findCategoryMenuItem,
  resolveApiLeafCategoryId,
  resolveApiParentCategoryId,
} from "@/constants/categoryConstants";
import { DUMMY_PRODUCTS } from "@/features/products/dummyProducts";
import { isUuid } from "@/lib/parseOptionalId";
import { apiFetch } from "@/services/api";
import type { Category, Product, ProductListParams } from "@/types/productTypes";

/** 기본 true. 실 API: .env에 NEXT_PUBLIC_USE_MOCK=false */
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

type BeCategory = {
  id: string;
  name: string;
  parentId: string | null;
};

type BeProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  productUrl: string | null;
  categoryId: string;
  purchaseCount: number;
  category?: BeCategory | null;
};

type BeListResponse = {
  message?: string;
  data: BeProduct[];
  pagination?: unknown;
};

type BeDetailResponse = {
  message?: string;
  data: BeProduct;
};

/**
 * BE 상품은 leaf categoryId에 붙습니다.
 * FE 메뉴는 대분류(categoryId) + 소분류(subCategoryId)이므로 parent/leaf로 나눕니다.
 */
function mapBeProduct(product: BeProduct): Product {
  const leaf = product.category;
  const parentId = leaf?.parentId ?? null;

  const subCategory: Product["subCategory"] = leaf
    ? {
        id: leaf.id,
        name: leaf.name,
        categoryId: parentId ?? leaf.id,
      }
    : undefined;

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    url: product.productUrl ?? "",
    photo: product.imageUrl ?? "",
    categoryId: parentId ?? product.categoryId,
    subCategoryId: product.categoryId,
    category: parentId
      ? {
          id: parentId,
          name: findCategoryMenuItem(parentId)?.name ?? "",
        }
      : leaf
        ? { id: leaf.id, name: leaf.name }
        : undefined,
    subCategory,
    purchaseCount: product.purchaseCount,
  };
}

function filterMockProducts(params: ProductListParams = {}): Product[] {
  let items = [...DUMMY_PRODUCTS];

  if (params.categoryId !== undefined) {
    items = items.filter(
      (product) => String(product.categoryId) === String(params.categoryId),
    );
  }

  // 소분류 id는 대분류마다 1부터 다시 쓰이므로 categoryId와 함께 매칭
  if (params.subCategoryId !== undefined) {
    items = items.filter((product) => {
      const sameSub =
        String(product.subCategoryId) === String(params.subCategoryId);
      if (params.categoryId === undefined) return sameSub;
      return (
        sameSub && String(product.categoryId) === String(params.categoryId)
      );
    });
  }

  items.sort((a, b) => {
    switch (params.sort) {
      case "popular":
        return (b.purchaseCount ?? 0) - (a.purchaseCount ?? 0);
      case "priceAsc":
        return a.price - b.price;
      case "priceDesc":
        return b.price - a.price;
      case "latest":
      default:
        return Number(b.id) - Number(a.id);
    }
  });

  const page = params.page ?? 1;
  const pageSize = params.pageSize;

  if (pageSize !== undefined && pageSize > 0) {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }

  return items;
}

function filterApiProductsByParent(
  items: Product[],
  parentApiId: string,
): Product[] {
  return items.filter(
    (product) =>
      String(product.categoryId) === parentApiId ||
      String(product.subCategory?.categoryId) === parentApiId,
  );
}

export async function getProducts(
  params: ProductListParams = {},
): Promise<Product[]> {
  if (USE_MOCK) {
    return filterMockProducts(params);
  }

  const leafApiId = resolveApiLeafCategoryId(params);
  const parentApiId = resolveApiParentCategoryId(params.categoryId);

  const search = new URLSearchParams();
  // BE는 leaf categoryId만 필터. 소분류 선택 시 leaf uuid 전달
  if (leafApiId) {
    search.set("categoryId", leafApiId);
  }
  if (params.sort) search.set("sort", params.sort);
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.pageSize !== undefined) {
    search.set("limit", String(params.pageSize));
  } else {
    search.set("limit", "30");
  }

  const query = search.toString();
  const path = `/api/products${query ? `?${query}` : ""}`;
  const response = await apiFetch<BeListResponse>(path);
  let mapped = (response.data ?? []).map(mapBeProduct);

  // 대분류만 선택: leaf 미지정 → parent 기준 보강 필터
  if (!leafApiId && parentApiId) {
    mapped = filterApiProductsByParent(mapped, parentApiId);
  }

  return mapped;
}

export async function getProduct(id: number | string): Promise<Product> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    const product = DUMMY_PRODUCTS.find((item) => item.id === Number(id));
    if (!product) {
      throw new Error(`Product not found: ${id}`);
    }
    return product;
  }

  const response = await apiFetch<BeDetailResponse>(`/api/products/${id}`);
  return mapBeProduct(response.data);
}

export async function getCategories(): Promise<Category[]> {
  // TODO: BE /api/categories 연동 시 서버 트리로 교체
  return TEMP_CATEGORIES;
}

export function isProductApiMock() {
  return USE_MOCK;
}

export function isApiCategoryId(value: number | string | undefined) {
  return typeof value === "string" && isUuid(value);
}
