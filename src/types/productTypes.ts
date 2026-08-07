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
}

export interface ProductListParams {
  categoryId?: number | string;
  subCategoryId?: number | string;
  sort?: "latest" | "popular" | "priceAsc" | "priceDesc";
  page?: number;
  pageSize?: number;
}

export interface MyProductListParams {
  sort?: "latest" | "priceAsc" | "priceDesc";
  page?: number;
}

export interface CreateProductInput {
  name: string;
  price: number;
  url?: string;
  photo?: string;
  categoryId: number | string;
  subCategoryId: number | string;
}
