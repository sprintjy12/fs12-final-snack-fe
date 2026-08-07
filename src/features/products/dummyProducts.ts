import { CATEGORY_MENU, TEMP_CATEGORIES } from "@/constants/categoryConstants";
import type { Product } from "@/types/productTypes";

function withRelations(
  product: Omit<Product, "category" | "subCategory">,
): Product {
  const category = TEMP_CATEGORIES.find((c) => c.id === product.categoryId);
  const subCategory = CATEGORY_MENU.find(
    (c) => c.id === product.categoryId,
  )?.subCategories.find((s) => s.id === product.subCategoryId);

  return {
    ...product,
    category,
    subCategory,
  };
}

/** Figma Card/상품리스트 원본 이미지 (`public/products/`) */
const SODA_PHOTOS = {
  "코카콜라 제로": "코카콜라_제로.png",
  코카콜라: "코카콜라.png",
  "환타 오렌지": "환타_오렌지.png",
  스프라이트: "스프라이트.png",
} as const;

/** 시안 1·2행: 청량・탄산음료 (subCategoryId: 1) */
const SODA_ROW: Omit<
  Product,
  "id" | "category" | "subCategory" | "url" | "photo"
>[] = [
  {
    name: "코카콜라 제로",
    price: 2000,
    categoryId: 2,
    subCategoryId: 1,
    purchaseCount: 29,
  },
  {
    name: "코카콜라",
    price: 2000,
    categoryId: 2,
    subCategoryId: 1,
    purchaseCount: 29,
  },
  {
    name: "환타 오렌지",
    price: 2000,
    categoryId: 2,
    subCategoryId: 1,
    purchaseCount: 29,
  },
  {
    name: "스프라이트",
    price: 2000,
    categoryId: 2,
    subCategoryId: 1,
    purchaseCount: 29,
  },
];

/** 과채음료 (subCategoryId: 2) — 탄산과 구분되는 mock */
const JUICE_ROW: Omit<
  Product,
  "id" | "category" | "subCategory" | "url" | "photo"
>[] = [
  {
    name: "오렌지 주스",
    price: 2500,
    categoryId: 2,
    subCategoryId: 2,
    purchaseCount: 14,
  },
  {
    name: "사과 주스",
    price: 2500,
    categoryId: 2,
    subCategoryId: 2,
    purchaseCount: 11,
  },
  {
    name: "포도 주스",
    price: 2700,
    categoryId: 2,
    subCategoryId: 2,
    purchaseCount: 9,
  },
  {
    name: "토마토 주스",
    price: 2300,
    categoryId: 2,
    subCategoryId: 2,
    purchaseCount: 7,
  },
];

const JUICE_PHOTOS: Record<(typeof JUICE_ROW)[number]["name"], string> = {
  "오렌지 주스": "juice_orange.svg",
  "사과 주스": "juice_apple.svg",
  "포도 주스": "juice_grape.svg",
  "토마토 주스": "juice_tomato.svg",
};

function buildDrinkRows(
  row: Omit<Product, "id" | "category" | "subCategory" | "url" | "photo">[],
  photos: Record<string, string>,
  startId: number,
  rowCount: number,
): Product[] {
  const items: Product[] = [];
  let id = startId;

  for (let r = 0; r < rowCount; r += 1) {
    for (const item of row) {
      items.push(
        withRelations({
          id,
          url: `https://example.com/products/${1000 + id}`,
          photo: photos[item.name] ?? SODA_PHOTOS["코카콜라"],
          ...item,
        }),
      );
      id += 1;
    }
  }

  return items;
}

/**
 * 상품 리스트 와이어용 더미.
 * API 필드: id, name, price, url, photo, categoryId, subCategoryId
 */
export const DUMMY_PRODUCTS: Product[] = [
  ...buildDrinkRows(SODA_ROW, SODA_PHOTOS, 1, 2),
  ...buildDrinkRows(JUICE_ROW, JUICE_PHOTOS, 9, 1),
  withRelations({
    id: 13,
    name: "오리온 초코파이",
    price: 4000,
    url: "https://example.com/products/1013",
    photo: "13_오리온_초코파이.png",
    categoryId: 1,
    subCategoryId: 3,
    purchaseCount: 18,
  }),
  withRelations({
    id: 14,
    name: "삼다수 2L",
    price: 1500,
    url: "https://example.com/products/1014",
    photo: "14_삼다수_2L.png",
    categoryId: 3,
    subCategoryId: 1,
    purchaseCount: 55,
  }),
  withRelations({
    id: 15,
    name: "컵라면 세트",
    price: 5200,
    url: "https://example.com/products/1015",
    photo: "15_컵라면_세트.png",
    categoryId: 4,
    subCategoryId: 2,
    purchaseCount: 12,
  }),
  withRelations({
    id: 16,
    name: "물티슈",
    price: 3900,
    url: "https://example.com/products/1016",
    photo: "16_물티슈.png",
    categoryId: 6,
    subCategoryId: 1,
    purchaseCount: 21,
  }),
];
