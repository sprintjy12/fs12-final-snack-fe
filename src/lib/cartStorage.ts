export const CART_STORAGE_KEY = "snack-captain-cart";
/** 같은 탭에서 장바구니 변경을 Header 등에 알릴 때 사용 */
export const CART_CHANGE_EVENT = "snack-captain-cart-change";
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 999;

export type CartItem = {
  productId: number;
  quantity: number;
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function notifyCartChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

function saveCartItems(items: CartItem[]): CartItem[] {
  if (canUseStorage()) {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }
  notifyCartChange();
  return items;
}

export function getCartItems(): CartItem[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as CartItem).productId === "number" &&
        typeof (item as CartItem).quantity === "number",
    );
  } catch {
    return [];
  }
}

export function getCartItemCount(): number {
  return getCartItems().reduce((sum, item) => {
    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) return sum;
    return sum + Math.floor(quantity);
  }, 0);
}

/** 같은 productId가 있으면 수량을 더함 */
export function addToCart(productId: number, quantity: number): CartItem[] {
  const nextQuantity = Math.max(MIN_QUANTITY, Math.floor(quantity));
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
    : [...items, { productId, quantity: Math.min(MAX_QUANTITY, nextQuantity) }];

  return saveCartItems(next);
}

/** 장바구니 수량을 절대값으로 설정 (1–999) */
export function setCartQuantity(
  productId: number,
  quantity: number,
): CartItem[] {
  const nextQuantity = Math.min(
    MAX_QUANTITY,
    Math.max(MIN_QUANTITY, Math.floor(quantity)),
  );
  const items = getCartItems();
  if (!items.some((item) => item.productId === productId)) return items;

  return saveCartItems(
    items.map((item) =>
      item.productId === productId
        ? { ...item, quantity: nextQuantity }
        : item,
    ),
  );
}

export function removeFromCart(productId: number): CartItem[] {
  return saveCartItems(
    getCartItems().filter((item) => item.productId !== productId),
  );
}

export function removeFromCartMany(productIds: number[]): CartItem[] {
  const removeSet = new Set(productIds);
  return saveCartItems(
    getCartItems().filter((item) => !removeSet.has(item.productId)),
  );
}

export function clearCart(): CartItem[] {
  return saveCartItems([]);
}
