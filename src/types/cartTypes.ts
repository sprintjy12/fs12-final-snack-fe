/** GET /api/cart — 장바구니 항목에 포함되는 상품 정보 */
export type CartProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
};

/** 장바구니 항목 (상품 미포함) */
export type CartItemRecord = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

/** 장바구니 항목 (상품 포함) */
export type CartItemWithProduct = CartItemRecord & {
  product: CartProduct;
};

export type CartSummary = {
  totalQuantity: number;
  totalPrice: number;
};

/** GET /api/cart 응답 data */
export type CartResponse = {
  items: CartItemWithProduct[];
  summary: CartSummary;
};

export type AddToCartRequest = {
  productId: string;
  quantity?: number;
};

export type UpdateCartItemRequest = {
  delta: 1 | -1;
};

export type DeleteSelectedCartRequest = {
  cartItemIds: string[];
};

export type DeleteManyResult = {
  count: number;
};

export type UpdateCartItemParams = {
  cartId: string;
  request: UpdateCartItemRequest;
};
