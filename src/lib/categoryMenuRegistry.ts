import type { CategoryMenuItem } from "@/constants/categoryConstants";

/** API 모드에서 `/api/categories`로 받은 트리. null이면 정적 CATEGORY_MENU 사용 */
let runtimeMenu: CategoryMenuItem[] | null = null;

export function setRuntimeCategoryMenu(menu: CategoryMenuItem[] | null) {
  runtimeMenu = menu;
}

export function getRuntimeCategoryMenu(): CategoryMenuItem[] | null {
  return runtimeMenu;
}
