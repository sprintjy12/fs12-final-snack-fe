import type { Category, ProductListParams, SubCategory } from "@/types/productTypes";
import { isUuid } from "@/lib/parseOptionalId";

export const SORT_OPTIONS: {
  value: NonNullable<ProductListParams["sort"]>;
  label: string;
}[] = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "판매순" },
  { value: "priceAsc", label: "낮은가격순" },
  { value: "priceDesc", label: "높은가격순" },
];

export type CategoryMenuSubItem = SubCategory & {
  /** BE leaf Category.id — 상품.categoryId와 동일 계층 */
  apiId: string;
};

export type CategoryMenuItem = Category & {
  /** BE parent Category.id */
  apiId: string;
  subCategories: CategoryMenuSubItem[];
};

/**
 * BE seed(`fs12-final-snack-be/prisma/seed.ts`)와 맞춘 고정 uuid.
 * mock 메뉴는 숫자 id를 쓰고, API 모드에서 apiId로 변환합니다.
 *
 * 규칙:
 * - 대분류: ...000001 ~ ...000007
 * - 소분류(leaf): ...0001XY (X=대분류, Y=소분류 순번) — 음료 탄산/과채는 기존 011/012 유지
 */
const API = {
  snack: "00000000-0000-4000-8000-000000000001",
  drink: "00000000-0000-4000-8000-000000000002",
  water: "00000000-0000-4000-8000-000000000003",
  meal: "00000000-0000-4000-8000-000000000004",
  fresh: "00000000-0000-4000-8000-000000000005",
  supply: "00000000-0000-4000-8000-000000000006",
  coffee: "00000000-0000-4000-8000-000000000007",
  // snack leaves
  snackChip: "00000000-0000-4000-8000-000000000101",
  snackCookie: "00000000-0000-4000-8000-000000000102",
  snackCandy: "00000000-0000-4000-8000-000000000103",
  // drink leaves (011/012는 기존 seed와 동일)
  soda: "00000000-0000-4000-8000-000000000011",
  juice: "00000000-0000-4000-8000-000000000012",
  energy: "00000000-0000-4000-8000-000000000013",
  drinkCoffee: "00000000-0000-4000-8000-000000000014",
  healthDrink: "00000000-0000-4000-8000-000000000015",
  // water leaves
  plainWater: "00000000-0000-4000-8000-000000000031",
  sparkling: "00000000-0000-4000-8000-000000000032",
  // meal leaves
  noodle: "00000000-0000-4000-8000-000000000041",
  instantMeal: "00000000-0000-4000-8000-000000000042",
  // fresh leaves
  fruit: "00000000-0000-4000-8000-000000000051",
  salad: "00000000-0000-4000-8000-000000000052",
  // supply leaves
  disposable: "00000000-0000-4000-8000-000000000061",
  cleaning: "00000000-0000-4000-8000-000000000062",
  // coffee leaves
  coffeeBean: "00000000-0000-4000-8000-000000000071",
  coffeeCapsule: "00000000-0000-4000-8000-000000000072",
} as const;

/**
 * 상품 리스트 GNB/하위 메뉴용 카테고리.
 * Figma: 상단 대분류 + 선택 시 소분류 탭
 * TODO: /api/categories 연동 시 서버 트리로 교체 (apiId 매핑 유지)
 */
export const CATEGORY_MENU: CategoryMenuItem[] = [
  {
    id: 1,
    apiId: API.snack,
    name: "스낵",
    subCategories: [
      { id: 1, apiId: API.snackChip, name: "과자 · 스낵", categoryId: 1 },
      { id: 2, apiId: API.snackCookie, name: "쿠키 · 비스킷", categoryId: 1 },
      { id: 3, apiId: API.snackCandy, name: "초콜릿 · 캔디", categoryId: 1 },
    ],
  },
  {
    id: 2,
    apiId: API.drink,
    name: "음료",
    subCategories: [
      { id: 1, apiId: API.soda, name: "청량・탄산음료", categoryId: 2 },
      { id: 2, apiId: API.juice, name: "과채음료", categoryId: 2 },
      { id: 3, apiId: API.energy, name: "에너지음료", categoryId: 2 },
      { id: 4, apiId: API.drinkCoffee, name: "원두커피", categoryId: 2 },
      { id: 5, apiId: API.healthDrink, name: "건강음료", categoryId: 2 },
    ],
  },
  {
    id: 3,
    apiId: API.water,
    name: "생수",
    subCategories: [
      { id: 1, apiId: API.plainWater, name: "생수", categoryId: 3 },
      { id: 2, apiId: API.sparkling, name: "스파클링", categoryId: 3 },
    ],
  },
  {
    id: 4,
    apiId: API.meal,
    name: "간편식",
    subCategories: [
      { id: 1, apiId: API.noodle, name: "라면 · 면", categoryId: 4 },
      { id: 2, apiId: API.instantMeal, name: "즉석식품", categoryId: 4 },
    ],
  },
  {
    id: 5,
    apiId: API.fresh,
    name: "신선식품",
    subCategories: [
      { id: 1, apiId: API.fruit, name: "과일", categoryId: 5 },
      { id: 2, apiId: API.salad, name: "샐러드", categoryId: 5 },
    ],
  },
  {
    id: 6,
    apiId: API.supply,
    name: "비품",
    subCategories: [
      { id: 1, apiId: API.disposable, name: "일회용품", categoryId: 6 },
      { id: 2, apiId: API.cleaning, name: "청소 · 위생", categoryId: 6 },
    ],
  },
  {
    id: 7,
    apiId: API.coffee,
    name: "원두커피",
    subCategories: [
      { id: 1, apiId: API.coffeeBean, name: "원두", categoryId: 7 },
      { id: 2, apiId: API.coffeeCapsule, name: "캡슐", categoryId: 7 },
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

function sameId(a: number | string, b: number | string) {
  return String(a) === String(b);
}

export function findCategoryMenuItem(
  categoryId: number | string | undefined,
): CategoryMenuItem | undefined {
  if (categoryId === undefined) return undefined;
  return CATEGORY_MENU.find(
    (item) => sameId(item.id, categoryId) || item.apiId === categoryId,
  );
}

export function findSubCategoryMenuItem(
  categoryId: number | string | undefined,
  subCategoryId: number | string | undefined,
): CategoryMenuSubItem | undefined {
  if (subCategoryId === undefined) return undefined;
  const parent = findCategoryMenuItem(categoryId);
  const pools = parent
    ? parent.subCategories
    : CATEGORY_MENU.flatMap((c) => c.subCategories);
  const matches = pools.filter(
    (sub) => sameId(sub.id, subCategoryId) || sub.apiId === subCategoryId,
  );
  // parent 없이 숫자 id만 오면 대분류마다 1,2…가 겹침 → 유일한 경우만 채택
  return matches.length === 1 ? matches[0] : undefined;
}

/**
 * BE `GET /api/products?categoryId=` 에 넣을 leaf uuid.
 * 소분류 선택 시 leaf, 대분류만 선택 시 undefined (부모는 클라이언트 보강 필터).
 */
export function resolveApiLeafCategoryId(
  params: Pick<ProductListParams, "categoryId" | "subCategoryId">,
): string | undefined {
  const { categoryId, subCategoryId } = params;

  if (subCategoryId !== undefined) {
    if (typeof subCategoryId === "string" && isUuid(subCategoryId)) {
      return subCategoryId;
    }
    return findSubCategoryMenuItem(categoryId, subCategoryId)?.apiId;
  }

  return undefined;
}

/** 대분류만 선택된 경우 BE/매핑용 parent uuid */
export function resolveApiParentCategoryId(
  categoryId: number | string | undefined,
): string | undefined {
  if (categoryId === undefined) return undefined;
  if (typeof categoryId === "string" && isUuid(categoryId)) return categoryId;
  return findCategoryMenuItem(categoryId)?.apiId;
}

/**
 * 대분류에 속한 leaf uuid 목록.
 * BE는 leaf categoryId만 필터하므로 대분류 조회 시 이 목록으로 조회합니다.
 */
export function resolveApiLeafCategoryIdsForParent(
  categoryId: number | string | undefined,
): string[] {
  const parent = findCategoryMenuItem(categoryId);
  if (!parent) return [];
  return parent.subCategories.map((sub) => sub.apiId);
}

/** API 모드에서 leaf 매핑이 있는 소분류만 선택 가능 */
export function isApiSelectableSubCategory(
  categoryId: number | string | undefined,
  subCategoryId: number | string | undefined,
): boolean {
  return Boolean(resolveApiLeafCategoryId({ categoryId, subCategoryId }));
}

export { API as CATEGORY_API_IDS };
