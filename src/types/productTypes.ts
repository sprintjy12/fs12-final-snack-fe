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
  /** 등록자 user id — 상세 본인 상품 케밥 분기용 */
  createdById?: string;
}

export interface ProductListParams {
  categoryId?: number | string;
  subCategoryId?: number | string;
  sort?: "latest" | "popular" | "priceAsc" | "priceDesc";
  page?: number;
  pageSize?: number;
  search?: string;
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

/** POST /api/products 요청 본문 (FE는 대·소분류를 받아 leaf categoryId로 변환) */
export interface CreateProductInput {
  name: string;
  price: number;
  /** 대분류 (메뉴 UI용). API에는 leaf UUID만 전송 */
  categoryId: number | string;
  /** 소분류 — API categoryId로 사용 */
  subCategoryId: number | string;
  /** 공개 이미지 URL (S3 업로드 후) */
  imageUrl: string;
  /** 상품 페이지 URL */
  productUrl: string;
}

/** 상품 수정 요청 — PATCH /api/products/:id (필드 전부 optional) */
export interface UpdateProductInput {
  id: number | string;
  name?: string;
  price?: number;
  /** 대분류 (메뉴 UI용) */
  categoryId?: number | string;
  /** 소분류 — API categoryId(leaf UUID)로 변환 */
  subCategoryId?: number | string;
  imageUrl?: string;
  productUrl?: string;
}
