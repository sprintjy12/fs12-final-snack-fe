// 상품파트 공통 타입. mock=number, BE=uuid string 모두 허용합니다.

export interface Category {
  id: number | string;
  name: string;
}

export interface SubCategory {
  id: number | string;
  name: string;
  categoryId: number | string;
}

/** 상품 API 응답 필드 기준 (mock=number, BE=uuid string) */
export interface Product {
  id: number | string;
  name: string;
  price: number;
  /** 상품 구매 링크 */
  url: string;
  /** 이미지 파일명 또는 URL */
  photo: string;
  categoryId: number | string;
  subCategoryId: number | string;
  /** 목록/상세에서 조인되어 올 수 있는 확장 필드 */
  category?: Category;
  subCategory?: SubCategory;
  /** 시안 뱃지용. API에 없으면 생략 */
  purchaseCount?: number;
  /** BE 등록 시각 (ISO). latest 정렬용 */
  createdAt?: string;
}

export interface ProductListParams {
  categoryId?: number | string;
  subCategoryId?: number | string;
  sort?: "latest" | "popular" | "priceAsc" | "priceDesc";
  page?: number;
  pageSize?: number;
}

/** GET /api/products/me — 전체 상품 목록과 동일 sort */
export type MyProductSort =
  | "latest"
  | "priceAsc"
  | "priceDesc"
  | "popular";

export type GetMyProductsParams = {
  page?: number;
  /** 기본 8, 최대 30 */
  limit?: number;
  sort?: MyProductSort;
};

/** GET /api/products/me 목록 한 줄 (+ category) */
export type MyProductListItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  productUrl: string | null;
  createdAt: string;
  category?: {
    id: string;
    name: string;
    parentId?: string | null;
    parent?: { id: string; name: string } | null;
  } | null;
};

export type MyProductListPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type MyProductListResponse = {
  message: string;
  data: MyProductListItem[];
  pagination: MyProductListPagination;
};

export interface CreateProductInput {
  name: string;
  price: number;
  url?: string;
  photo?: string;
  categoryId: number | string;
  subCategoryId: number | string;
}

/** 상품 수정 요청 — Create + 대상 id */
export interface UpdateProductInput extends CreateProductInput {
  id: number | string;
}
