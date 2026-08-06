export type OrderListSort = "latest" | "highPrice" | "lowPrice";

export type OrderListType = "DIRECT" | "REQUEST";

/** GET /api/orders 목록 한 줄 */
export type OrderListItem = {
  id: string;
  type: OrderListType;
  approvedAt: string;
  totalPrice: number;
  totalQuantity: number;
  requesterName: string;
  processorName: string;
  createdAt: string;
  /** 대표 상품명 */
  firstProductName: string;
  /** 품종 수 (외 N건 표시용) */
  itemCount: number;
};

export type OrderListPagination = {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
};

export type OrderListResponse = {
  success: boolean;
  message: string;
  data: OrderListItem[];
  pagination: OrderListPagination;
};

export type GetOrdersParams = {
  page?: number;
  limit?: number;
  sort?: OrderListSort;
};

export type OrderDetailStatus = "APPROVED" | "REJECTED" | "PENDING";

/** GET /api/orders/:id 품목 한 줄 */
export type OrderDetailItem = {
  productName: string;
  imageUrl: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discounted?: boolean;
};

/** GET /api/orders/:id data */
export type OrderDetailData = {
  orderId: string;
  type: OrderListType;
  status: OrderDetailStatus;
  productAmount: number;
  shippingFee: number;
  totalPrice: number;
  totalQuantity: number;
  itemCount: number;
  requestMessage: string;
  responseMessage: string;
  requestedAt: string;
  approvedAt: string;
  requesterName: string;
  processorName: string;
  items: OrderDetailItem[];
};

export type OrderDetailResponse = {
  success: boolean;
  message: string;
  data: OrderDetailData;
};
