import { TEMP_CATEGORIES } from "@/constants/categoryConstants";
import { DUMMY_PRODUCTS } from "@/features/products/dummyProducts";
import { apiFetch } from "@/services/api";
import type { Category, Product, ProductListParams } from "@/types/productTypes";

/** 기본 true. 백엔드 준비되면 .env에 NEXT_PUBLIC_USE_MOCK=false */
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

function filterMockProducts(params: ProductListParams = {}): Product[] {
  let items = [...DUMMY_PRODUCTS];

  if (params.categoryId !== undefined) {
    items = items.filter((product) => product.categoryId === params.categoryId);
  }

  if (params.subCategoryId !== undefined) {
    items = items.filter(
      (product) => product.subCategoryId === params.subCategoryId,
    );
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
        return a.id - b.id;
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

export async function getProducts(
  params: ProductListParams = {},
): Promise<Product[]> {
  if (USE_MOCK) {
    return filterMockProducts(params);
  }

  const search = new URLSearchParams();
  if (params.categoryId !== undefined) {
    search.set("categoryId", String(params.categoryId));
  }
  if (params.subCategoryId !== undefined) {
    search.set("subCategoryId", String(params.subCategoryId));
  }
  if (params.sort) search.set("sort", params.sort);
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.pageSize !== undefined) {
    search.set("pageSize", String(params.pageSize));
  }

  const query = search.toString();
  return apiFetch<Product[]>(`/products${query ? `?${query}` : ""}`);
}

export async function getProduct(id: number): Promise<Product> {
  if (USE_MOCK) {
    const product = DUMMY_PRODUCTS.find((item) => item.id === id);
    if (!product) {
      throw new Error(`Product not found: ${id}`);
    }
    return product;
  }

  return apiFetch<Product>(`/products/${id}`);
}

export async function getCategories(): Promise<Category[]> {
  if (USE_MOCK) {
    return TEMP_CATEGORIES;
  }

  return apiFetch<Category[]>("/categories");
}
