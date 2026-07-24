import type { Category, ProductListParams, SubCategory } from "@/types/productTypes";

export const SORT_OPTIONS: {
  value: NonNullable<ProductListParams["sort"]>;
  label: string;
}[] = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "판매순" },
  { value: "priceAsc", label: "낮은가격순" },
  { value: "priceDesc", label: "높은가격순" },
];

export type CategoryMenuItem = Category & {
  subCategories: SubCategory[];
};

/**
 * 상품 리스트 GNB/하위 메뉴용 카테고리.
 * Figma: 상단 대분류 + 선택 시 소분류 탭
 * TODO: /api/categories 연동 시 교체
 */
export const CATEGORY_MENU: CategoryMenuItem[] = [
  {
    id: 1,
    name: "스낵",
    subCategories: [
      { id: 1, name: "과자 · 스낵", categoryId: 1 },
      { id: 2, name: "쿠키 · 비스킷", categoryId: 1 },
      { id: 3, name: "초콜릿 · 캔디", categoryId: 1 },
    ],
  },
  {
    id: 2,
    name: "음료",
    subCategories: [
      { id: 1, name: "청량 ・탄산음료", categoryId: 2 },
      { id: 2, name: "과즙음료", categoryId: 2 },
      { id: 3, name: "에너지음료", categoryId: 2 },
      { id: 4, name: "원두커피", categoryId: 2 },
      { id: 5, name: "건강음료", categoryId: 2 },
    ],
  },
  {
    id: 3,
    name: "생수",
    subCategories: [
      { id: 1, name: "생수", categoryId: 3 },
      { id: 2, name: "스파클링", categoryId: 3 },
    ],
  },
  {
    id: 4,
    name: "간편식",
    subCategories: [
      { id: 1, name: "라면 · 면", categoryId: 4 },
      { id: 2, name: "즉석식품", categoryId: 4 },
    ],
  },
  {
    id: 5,
    name: "신선식품",
    subCategories: [
      { id: 1, name: "과일", categoryId: 5 },
      { id: 2, name: "샐러드", categoryId: 5 },
    ],
  },
  {
    id: 6,
    name: "비품",
    subCategories: [
      { id: 1, name: "일회용품", categoryId: 6 },
      { id: 2, name: "청소 · 위생", categoryId: 6 },
    ],
  },
  {
    id: 7,
    name: "원두커피",
    subCategories: [
      { id: 1, name: "원두", categoryId: 7 },
      { id: 2, name: "캡슐", categoryId: 7 },
    ],
  },
];

/** 표시 순서 (Figma): 스낵 → … → 원두커피 → 비품 */
export const CATEGORY_MENU_ORDERED: CategoryMenuItem[] = [
  ...CATEGORY_MENU.filter((item) => item.id !== 6 && item.id !== 7),
  CATEGORY_MENU.find((item) => item.id === 7)!,
  CATEGORY_MENU.find((item) => item.id === 6)!,
];

/** API/목록용 평면 카테고리 (대분류) */
export const TEMP_CATEGORIES: Category[] = CATEGORY_MENU.map(
  ({ id, name }) => ({ id, name }),
);
