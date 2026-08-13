import {
  CATEGORY_MENU_ORDERED,
  findCategoryMenuItem,
  resolveApiLeafCategoryId,
  resolveApiParentCategoryId,
  type CategoryMenuItem,
} from "@/constants/categoryConstants";
import { setRuntimeCategoryMenu } from "@/lib/categoryMenuRegistry";
import { isUuid } from "@/lib/parseOptionalId";
import { apiClient } from "@/api/core/apiClient";
import { ensureAccessToken } from "@/api/authApi";
import type {
  Category,
  CreateProductInput,
  GetMyProductsParams,
  MyProductListItem,
  MyProductListResponse,
  Product,
  ProductListParams,
  UpdateProductInput,
} from "@/types/productTypes";

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
  createdAt?: string;
  createdById?: string;
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
    createdAt: product.createdAt,
    createdById: product.createdById,
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

/** 목차/필터용 카테고리 트리를 로드해 레지스트리에 캐시 */
export async function ensureCategoryMenu(): Promise<CategoryMenuItem[]> {
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

  const categoryIdToSend = leafApiId ?? parentApiId ?? undefined;

    return fetchBeProductPage({
    categoryId: categoryIdToSend,
    sort: params.sort,
    page: params.page,
    pageSize: params.pageSize ?? 8,
  });
}

export async function getProduct(id: number | string): Promise<Product> {
  await ensureAccessToken();

  // 부모 이름 매핑용
  await ensureCategoryMenu().catch(() => CATEGORY_MENU_ORDERED);

  const response = await apiClient.get<BeDetailResponse>(`/api/products/${id}`);
  return mapBeProduct(response.data.data);
}

/**
 * 상품 수정 — PATCH /api/products/:id
 * Body 필드는 전부 optional(부분 수정). Authorization Bearer 필요.
 */
export async function updateProduct(
  input: UpdateProductInput,
): Promise<Product> {
  await ensureAccessToken();
  await ensureCategoryMenu().catch(() => CATEGORY_MENU_ORDERED);

  const body: Record<string, unknown> = {};

  if (input.name !== undefined) {
    body.name = input.name;
  }
  if (input.price !== undefined) {
    body.price = input.price;
  }
  if (input.productUrl !== undefined) {
    body.productUrl = input.productUrl;
  }
  if (input.imageUrl !== undefined) {
    body.imageUrl = input.imageUrl;
  }
  if (input.stock !== undefined) {
    body.stock = input.stock;
  }

  if (input.categoryId !== undefined || input.subCategoryId !== undefined) {
    const leafApiId =
      resolveApiLeafCategoryId({
        categoryId: input.categoryId,
        subCategoryId: input.subCategoryId,
      }) ??
      (input.subCategoryId !== undefined
        ? String(input.subCategoryId)
        : undefined);
    if (leafApiId) {
      body.categoryId = leafApiId;
    }
  }

  const response = await apiClient.patch<BeDetailResponse>(
    `/api/products/${input.id}`,
    body,
  );

  return mapBeProduct(response.data.data);
}

/** 상품 등록 — POST /api/products */
export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  await ensureAccessToken();
  await ensureCategoryMenu().catch(() => CATEGORY_MENU_ORDERED);

  const leafApiId =
    resolveApiLeafCategoryId({
      categoryId: input.categoryId,
      subCategoryId: input.subCategoryId,
    }) ?? String(input.subCategoryId);

  const response = await apiClient.post<BeDetailResponse>("/api/products", {
    name: input.name,
    price: input.price,
    categoryId: leafApiId,
    imageUrl: input.imageUrl,
    stock: input.stock,
    productUrl: input.productUrl,
  });

  return mapBeProduct(response.data.data);
}

export async function getMyProducts(
  params: GetMyProductsParams = {},
): Promise<MyProductListResponse> {
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

  // 상위 카테고리명 조회용 (목록 응답에는 parent 객체가 없을 수 있음)
  await ensureCategoryMenu().catch(() => undefined);

  return {
    ...response.data,
    data: (response.data.data ?? []).map(withCategoryParent),
  };
}

/** 상품 삭제 — DELETE /api/products/:productId */
export async function deleteProduct(productId: string): Promise<void> {
  await ensureAccessToken();
  await apiClient.delete(`/api/products/${productId}`);
}

export async function getCategories(): Promise<CategoryMenuItem[]> {
  return ensureCategoryMenu();
}

/** 평면 대분류만 필요할 때 */
export async function getCategoryList(): Promise<Category[]> {
  const menu = await ensureCategoryMenu();
  return menu.map(({ id, name }) => ({ id, name }));
}

export function isApiCategoryId(value: number | string | undefined) {
  return typeof value === "string" && isUuid(value);
}
