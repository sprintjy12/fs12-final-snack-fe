export const CART_STORAGE_KEY = "snack-captain-cart";
/** 같은 탭에서 장바구니 변경을 Header 등에 알릴 때 사용 */
export const CART_CHANGE_EVENT = "snack-captain-cart-change";
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 999;

export type CartItem = {
  productId: number;
  quantity: number;
};

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

/**
 * 유한 수를 1..999 정수로 정규화.
 * NaN / Infinity / 비숫자는 null.
 */
function normalizeQuantity(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const floored = Math.floor(value);
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, floored));
}

function isValidCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as { productId?: unknown; quantity?: unknown };
  return (
    isPositiveInteger(item.productId) &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity >= MIN_QUANTITY &&
    item.quantity <= MAX_QUANTITY
  );
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function notifyCartChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

/** @returns 저장 성공 여부 */
function saveCartItems(items: CartItem[]): boolean {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    notifyCartChange();
    return true;
  } catch {
    return false;
  }
}

export function getCartItems(): CartItem[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidCartItem);
  } catch {
    return [];
  }
}

export function getCartItemCount(): number {
  return getCartItems().reduce((sum, item) => sum + item.quantity, 0);
}

/** 같은 productId가 있으면 수량을 더함. @returns 저장 성공 여부 */
export function addToCart(productId: number, quantity: number): boolean {
  if (!isPositiveInteger(productId)) return false;
  const nextQuantity = normalizeQuantity(quantity);
  if (nextQuantity === null) return false;

  const items = getCartItems();
  const existing = items.find((item) => item.productId === productId);

  const next = existing
    ? items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.min(
                MAX_QUANTITY,
                item.quantity + nextQuantity,
              ),
            }
          : item,
      )
    : [...items, { productId, quantity: nextQuantity }];

  return saveCartItems(next);
}

/** 장바구니 수량을 절대값으로 설정 (1–999). 실패 시 기존 목록 반환 */
export function setCartQuantity(
  productId: number,
  quantity: number,
): CartItem[] {
  if (!isPositiveInteger(productId)) return getCartItems();
  const nextQuantity = normalizeQuantity(quantity);
  const items = getCartItems();
  if (nextQuantity === null) return items;
  if (!items.some((item) => item.productId === productId)) return items;

  const next = items.map((item) =>
    item.productId === productId
      ? { ...item, quantity: nextQuantity }
      : item,
  );
  return saveCartItems(next) ? next : items;
}

/** 실패 시 기존 목록 반환 */
export function removeFromCart(productId: number): CartItem[] {
  const items = getCartItems();
  if (!isPositiveInteger(productId)) return items;
  const next = items.filter((item) => item.productId !== productId);
  return saveCartItems(next) ? next : items;
}

/** 실패 시 기존 목록 반환 */
export function removeFromCartMany(productIds: number[]): CartItem[] {
  const items = getCartItems();
  const removeSet = new Set(productIds.filter(isPositiveInteger));
  if (removeSet.size === 0) return items;
  const next = items.filter((item) => !removeSet.has(item.productId));
  return saveCartItems(next) ? next : items;
}

/** 실패 시 기존 목록 반환 */
export function clearCart(): CartItem[] {
  const items = getCartItems();
  return saveCartItems([]) ? [] : items;
}
