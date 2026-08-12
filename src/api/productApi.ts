import {
  CATEGORY_MENU_ORDERED,
  TEMP_CATEGORIES,
  findCategoryMenuItem,
  resolveApiLeafCategoryId,
  resolveApiLeafCategoryIdsForParent,
  resolveApiParentCategoryId,
  type CategoryMenuItem,
} from "@/constants/categoryConstants";
import { DUMMY_PRODUCTS } from "@/features/products/dummyProducts";
import { setRuntimeCategoryMenu } from "@/lib/categoryMenuRegistry";
import { isUuid } from "@/lib/parseOptionalId";
import { apiClient } from "@/api/core/apiClient";
import { ensureAccessToken } from "@/api/authApi";
import type {
  Category,
  GetMyProductsParams,
  MyProductListResponse,
  Product,
  ProductListParams,
  UpdateProductInput,
} from "@/types/productTypes";

/** 기본 true. 실 API: .env에 NEXT_PUBLIC_USE_MOCK=false */
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

type BeCategory = {
  id: string;
  name: string;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
};

type BeCategoryTreeNode = {
  id: string;
  name: string;
  parentId: string | null;
  children?: BeCategoryTreeNode[];
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

type BeCategoriesResponse = {
  message?: string;
  data: BeCategoryTreeNode[];
};

/**
 * BE 상품은 leaf categoryId에 붙습니다.
 * FE 메뉴는 대분류(categoryId) + 소분류(subCategoryId)이므로 parent/leaf로 나눕니다.
 */
function mapBeProduct(product: BeProduct): Product {
  const leaf = product.category;
  const parentId = leaf?.parentId ?? leaf?.parent?.id ?? null;
  const parentName =
    leaf?.parent?.name ??
    (parentId ? findCategoryMenuItem(parentId)?.name : undefined) ??
    "";

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
          name: parentName || leaf?.name || "",
        }
      : leaf
        ? { id: leaf.id, name: leaf.name }
        : undefined,
    subCategory,
    purchaseCount: product.purchaseCount,
  };
}

function buildMenuFromBe(nodes: BeCategoryTreeNode[]): CategoryMenuItem[] {
  return nodes.map((parent) => ({
    id: parent.id,
    apiId: parent.id,
    name: parent.name,
    subCategories: (parent.children ?? []).map((child) => ({
      id: child.id,
      apiId: child.id,
      name: child.name,
      categoryId: parent.id,
    })),
  }));
}

function filterMockProducts(params: ProductListParams = {}): Product[] {
  let items = [...DUMMY_PRODUCTS];

  if (params.categoryId !== undefined) {
    items = items.filter(
      (product) => String(product.categoryId) === String(params.categoryId),
    );
  }

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
      default:
        return String(b.id).localeCompare(String(a.id));
    }
  });
  return next;
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

async function fetchBeProductPage(params: {
  categoryId?: string;
  sort?: ProductListParams["sort"];
  page?: number;
  pageSize?: number;
}): Promise<Product[]> {
  const response = await apiClient.get<BeListResponse>("/api/products", {
    params: {
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params.sort ? { sort: params.sort } : {}),
      ...(params.page !== undefined ? { page: params.page } : {}),
      limit: params.pageSize ?? 8,
    },
  });

  return (response.data.data ?? []).map(mapBeProduct);
}

async function fetchAllProductsForLeaf(
  leafId: string,
  sort: ProductListParams["sort"],
): Promise<Product[]> {
  const pageSize = 8;
  let page = 1;
  const all: Product[] = [];

  for (;;) {
    const batch = await fetchBeProductPage({
      categoryId: leafId,
      sort,
      page,
      pageSize,
    });
    all.push(...batch);
    if (batch.length < pageSize) break;
    page += 1;
    if (page > 20) break;
  }

  return all;
}

/** API 모드에서 목차/필터용 카테고리 트리를 로드해 레지스트리에 캐시 */
export async function ensureCategoryMenu(): Promise<CategoryMenuItem[]> {
  if (USE_MOCK) {
    setRuntimeCategoryMenu(null);
    return CATEGORY_MENU_ORDERED;
  }

  try {
    await ensureAccessToken();
    const response =
      await apiClient.get<BeCategoriesResponse>("/api/categories");
    const menu = buildMenuFromBe(response.data.data ?? []);
    setRuntimeCategoryMenu(menu);
    return menu;
  } catch {
    // BE 미기동/구버전이면 정적 메뉴로라도 GNB 유지
    setRuntimeCategoryMenu(null);
    return CATEGORY_MENU_ORDERED;
  }
}

export async function getProducts(
  params: ProductListParams = {},
): Promise<Product[]> {
  if (USE_MOCK) {
    return filterMockProducts(params);
  }

  await ensureAccessToken();

  // 대분류 leaf 목록 해석을 위해 메뉴를 먼저 맞춤
  if (params.categoryId !== undefined || params.subCategoryId !== undefined) {
    await ensureCategoryMenu();
  }

  const leafApiId = resolveApiLeafCategoryId(params);
  const parentApiId = resolveApiParentCategoryId(params.categoryId);
  const subSelected = params.subCategoryId !== undefined;

  if (subSelected && !leafApiId) {
    return [];
  }

  if (leafApiId) {
    return fetchBeProductPage({
      categoryId: leafApiId,
      sort: params.sort,
      page: params.page,
      pageSize: params.pageSize ?? 8,
    });
  }

  if (parentApiId) {
    const leafIds = resolveApiLeafCategoryIdsForParent(params.categoryId);
    if (leafIds.length === 0) return [];

    const results = await Promise.allSettled(
      leafIds.map((id) => fetchAllProductsForLeaf(id, params.sort)),
    );
    const batches = results
      .filter(
        (r): r is PromiseFulfilledResult<Product[]> => r.status === "fulfilled",
      )
      .map((r) => r.value);
    const merged = sortProducts(dedupeProducts(batches.flat()), params.sort);
    if (params.pageSize !== undefined && params.pageSize > 0) {
      const page = params.page ?? 1;
      const start = (page - 1) * params.pageSize;
      return merged.slice(start, start + params.pageSize);
    }
    return merged;
  }

  return fetchBeProductPage({
    sort: params.sort,
    page: params.page,
    pageSize: params.pageSize ?? 8,
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

  await ensureAccessToken();

  // 부모 이름 매핑용
  await ensureCategoryMenu().catch(() => CATEGORY_MENU_ORDERED);

  const response = await apiClient.get<BeDetailResponse>(`/api/products/${id}`);
  return mapBeProduct(response.data.data);
}

/**
 * 상품 수정.
 * mock: DUMMY_PRODUCTS 갱신 / API: PATCH /api/products/:id
 */
export async function updateProduct(
  input: UpdateProductInput,
): Promise<Product> {
  if (USE_MOCK) {
    const index = DUMMY_PRODUCTS.findIndex(
      (item) => String(item.id) === String(input.id),
    );
    if (index < 0) {
      throw new Error(`Product not found: ${input.id}`);
    }

    const current = DUMMY_PRODUCTS[index];
    const categoryMenuItem = findCategoryMenuItem(input.categoryId);
    const subCategoryMenuItem = categoryMenuItem?.subCategories.find(
      (sub) => String(sub.id) === String(input.subCategoryId),
    );

    const updated: Product = {
      ...current,
      name: input.name,
      price: input.price,
      url: input.url ?? current.url,
      photo: input.photo ?? current.photo,
      categoryId: input.categoryId,
      subCategoryId: input.subCategoryId,
      category: categoryMenuItem
        ? { id: categoryMenuItem.id, name: categoryMenuItem.name }
        : undefined,
      subCategory: subCategoryMenuItem
        ? {
            id: subCategoryMenuItem.id,
            name: subCategoryMenuItem.name,
            categoryId: input.categoryId,
          }
        : undefined,
    };
    return updated;
  }

  await ensureAccessToken();
  await ensureCategoryMenu().catch(() => CATEGORY_MENU_ORDERED);

  const leafApiId =
    resolveApiLeafCategoryId({
      categoryId: input.categoryId,
      subCategoryId: input.subCategoryId,
    }) ?? String(input.subCategoryId);

  const response = await apiClient.patch<BeDetailResponse>(
    `/api/products/${input.id}`,
    {
      name: input.name,
      price: input.price,
      categoryId: leafApiId,
      productUrl: input.url,
      imageUrl: input.photo,
    },
  );

  return mapBeProduct(response.data.data);
}

export async function getMyProducts(
  params: GetMyProductsParams = {},
): Promise<MyProductListResponse> {
  if (USE_MOCK) {
    return {
      message: "mock",
      data: [],
      pagination: {
        page: params.page ?? 1,
        limit: params.limit ?? 8,
        total: 0,
        totalPages: 0,
      },
    };
  }

  await ensureAccessToken();

  const response = await apiClient.get<MyProductListResponse>(
    "/api/products/me",
    {
      params: {
        ...(params.page !== undefined ? { page: params.page } : {}),
        ...(params.limit !== undefined ? { limit: params.limit } : {}),
        ...(params.sort ? { sort: params.sort } : {}),
      },
    },
  );

  return response.data;
}

export async function getCategories(): Promise<CategoryMenuItem[]> {
  return ensureCategoryMenu();
}

/** 평면 대분류만 필요할 때 */
export async function getCategoryList(): Promise<Category[]> {
  if (USE_MOCK) return TEMP_CATEGORIES;
  const menu = await ensureCategoryMenu();
  return menu.map(({ id, name }) => ({ id, name }));
}

export function isProductApiMock() {
  return USE_MOCK;
}

export function isApiCategoryId(value: number | string | undefined) {
  return typeof value === "string" && isUuid(value);
}
