import {
  TEMP_CATEGORIES,
  findCategoryMenuItem,
  resolveApiLeafCategoryId,
  resolveApiLeafCategoryIdsForParent,
  resolveApiParentCategoryId,
} from "@/constants/categoryConstants";
import { DUMMY_PRODUCTS } from "@/features/products/dummyProducts";
import { isUuid } from "@/lib/parseOptionalId";
import { apiFetch } from "@/services/api";
import type { Category, Product, ProductListParams } from "@/types/productTypes";

/** 기본 true. 실 API: .env에 NEXT_PUBLIC_USE_MOCK=false */
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

/** BE limit 상한 */
const BE_MAX_LIMIT = 30;

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
  createdAt?: string;
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
    createdAt: product.createdAt,
  };
}

function sortProducts(
  items: Product[],
  sort: ProductListParams["sort"],
): Product[] {
  const next = [...items];
  next.sort((a, b) => {
    switch (sort) {
      case "popular":
        return (b.purchaseCount ?? 0) - (a.purchaseCount ?? 0);
      case "priceAsc":
        return a.price - b.price;
      case "priceDesc":
        return b.price - a.price;
      case "latest":
      default: {
        // BE latest = createdAt desc. UUID 비교는 사용하지 않음
        const aTime = a.createdAt ? Date.parse(a.createdAt) : NaN;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : NaN;
        if (Number.isFinite(aTime) || Number.isFinite(bTime)) {
          return (Number.isFinite(bTime) ? bTime : 0) -
            (Number.isFinite(aTime) ? aTime : 0);
        }
        // mock: createdAt 없으면 number id 내림차순
        const aKey = String(a.id);
        const bKey = String(b.id);
        if (/^\d+$/.test(aKey) && /^\d+$/.test(bKey)) {
          return Number(bKey) - Number(aKey);
        }
        return 0;
      }
    }
  });
  return next;
}

function paginateProducts(
  items: Product[],
  page = 1,
  pageSize?: number,
): Product[] {
  if (pageSize === undefined) return items;
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function dedupeProducts(items: Product[]): Product[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = String(item.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** mock/API 공통: page·pageSize 정규화 (BE limit 상한 포함) */
function normalizePagination(params: ProductListParams = {}): {
  page: number;
  pageSize: number;
} {
  const rawPage = params.page;
  const rawSize = params.pageSize;

  const page =
    typeof rawPage === "number" && Number.isFinite(rawPage)
      ? Math.max(1, Math.floor(rawPage))
      : 1;

  const pageSize =
    typeof rawSize === "number" && Number.isFinite(rawSize) && rawSize > 0
      ? Math.min(Math.floor(rawSize), BE_MAX_LIMIT)
      : BE_MAX_LIMIT;

  return { page, pageSize };
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

  const { page, pageSize } = normalizePagination(params);
  items = sortProducts(items, params.sort);
  return paginateProducts(items, page, pageSize);
}

async function fetchBeProductPage(options: {
  categoryId?: string;
  sort?: ProductListParams["sort"];
  page: number;
  pageSize: number;
}): Promise<Product[]> {
  const search = new URLSearchParams();
  if (options.categoryId) search.set("categoryId", options.categoryId);
  if (options.sort) search.set("sort", options.sort);
  search.set("page", String(options.page));
  search.set("limit", String(options.pageSize));

  const query = search.toString();
  const response = await apiFetch<BeListResponse>(
    `/api/products${query ? `?${query}` : ""}`,
  );
  return (response.data ?? []).map(mapBeProduct);
}

/** leaf 한 개의 상품을 BE limit 단위로 모두 수집 */
async function fetchAllProductsForLeaf(
  leafId: string,
  sort?: ProductListParams["sort"],
): Promise<Product[]> {
  const collected: Product[] = [];
  let page = 1;

  while (page <= 50) {
    const chunk = await fetchBeProductPage({
      categoryId: leafId,
      sort,
      page,
      pageSize: BE_MAX_LIMIT,
    });
    collected.push(...chunk);
    if (chunk.length < BE_MAX_LIMIT) break;
    page += 1;
  }

  return collected;
}

export async function getProducts(
  params: ProductListParams = {},
): Promise<Product[]> {
  const { page, pageSize } = normalizePagination(params);

  if (USE_MOCK) {
    return filterMockProducts({ ...params, page, pageSize });
  }

  const leafApiId = resolveApiLeafCategoryId(params);
  const parentApiId = resolveApiParentCategoryId(params.categoryId);
  const subSelected = params.subCategoryId !== undefined;

  // 소분류를 골랐는데 leaf uuid가 없으면 대분류 전체로 떨어지지 않게 빈 목록
  if (subSelected && !leafApiId) {
    return [];
  }

  // 소분류(leaf) 선택: 서버 페이지네이션 그대로 사용
  if (leafApiId) {
    return fetchBeProductPage({
      categoryId: leafApiId,
      sort: params.sort,
      page,
      pageSize,
    });
  }

  // 대분류만 선택: 하위 leaf들을 조회·병합한 뒤 정렬/페이지네이션
  if (parentApiId) {
    const leafIds = resolveApiLeafCategoryIdsForParent(params.categoryId);
    if (leafIds.length === 0) return [];

    const batches = await Promise.all(
      leafIds.map((id) => fetchAllProductsForLeaf(id, params.sort)),
    );
    const merged = sortProducts(dedupeProducts(batches.flat()), params.sort);
    return paginateProducts(merged, page, pageSize);
  }

  // 필터 없음: 서버 페이지네이션
  return fetchBeProductPage({
    sort: params.sort,
    page,
    pageSize,
  });
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
