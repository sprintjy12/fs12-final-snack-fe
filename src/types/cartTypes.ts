export type AddToCartBody = {
  productId: string;
  quantity?: number;
};

export type CartItemData = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type AddToCartResponse = {
  message: string;
  data: CartItemData;
};
