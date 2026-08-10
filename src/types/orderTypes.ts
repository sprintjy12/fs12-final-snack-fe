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

/** GET /api/orders/my-requests 목록 한 줄 */
export type MyOrderRequestListItem = {
  id: string;
  type: OrderListType;
  status: OrderDetailStatus;
  approvedAt: string | null;
  totalPrice: number;
  totalQuantity: number;
  requesterName: string;
  processorName: string | null;
  createdAt: string;
  firstProductName: string;
  itemCount: number;
};

export type MyOrderRequestListResponse = {
  success: boolean;
  message: string;
  data: MyOrderRequestListItem[];
  pagination: OrderListPagination;
};

export type GetMyOrderRequestsParams = {
  page?: number;
  limit?: number;
  sort?: OrderListSort;
};

export type OrderDetailStatus =
  | "APPROVED"
  | "REJECTED"
  | "PENDING"
  | "CANCELLED";

/** GET /api/orders/:id 품목 한 줄 */
export type OrderDetailItem = {
  /** 장바구니 다시 담기 등에 사용. 일부 응답에는 없을 수 있음 */
  productId?: string;
  productName: string;
  imageUrl: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discounted?: boolean;
};

/** GET /api/orders/my-requests/:id data */
export type MyOrderRequestDetailData = {
  orderId: string;
  type: OrderListType;
  status: OrderDetailStatus;
  productAmount: number;
  shippingFee: number;
  totalPrice: number;
  itemCount: number;
  totalQuantity: number;
  requestMessage: string | null;
  responseMessage: string | null;
  requestedAt: string;
  approvedAt: string | null;
  requesterName: string | null;
  processorName: string | null;
  items: OrderDetailItem[];
};

export type MyOrderRequestDetailResponse = {
  success: boolean;
  message: string;
  data: MyOrderRequestDetailData;
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

export type OrderRequestListSort = "latest" | "highPrice" | "lowPrice";

/** GET /api/orders/requests 목록 품목 요약 */
export type OrderRequestItemsSummary = {
  firstProductName: string;
  itemCount: number;
};

/** GET /api/orders/requests 목록 한 줄 */
export type OrderRequestListItem = {
  id: string;
  requestedAt: string;
  totalPrice: number;
  totalQuantity: number;
  requesterName: string;
  itemsSummary: OrderRequestItemsSummary;
};

export type OrderRequestListResponse = {
  success: boolean;
  message: string;
  data: OrderRequestListItem[];
  pagination: OrderListPagination;
};

export type GetOrderRequestsParams = {
  page?: number;
  limit?: number;
  sort?: OrderRequestListSort;
};

/** GET /api/orders/requests/:id 예산 정보 */
export type OrderRequestDetailBudget = {
  yearMonth: string;
  budget: number;
  spent: number;
  remaining: number;
  isUnlimited: boolean;
};

/** GET /api/orders/requests/:id data */
export type OrderRequestDetailData = {
  orderId: string;
  type: OrderListType;
  status: OrderDetailStatus;
  productAmount: number;
  shippingFee: number;
  totalPrice: number;
  itemCount: number;
  totalQuantity: number;
  requestMessage: string | null;
  responseMessage: string | null;
  requestedAt: string;
  approvedAt: string | null;
  requesterName: string | null;
  processorName: string | null;
  items: OrderDetailItem[];
  budget: OrderRequestDetailBudget;
};

export type OrderRequestDetailResponse = {
  success: boolean;
  message: string;
  data: OrderRequestDetailData;
};

/** PATCH /api/orders/:id/approve|reject body */
export type ProcessOrderRequestBody = {
  responseMessage: string;
};

/** PATCH /api/orders/:id/approve|reject data */
export type ProcessOrderResult = {
  id: string;
  companyId: string;
  requesterId: string;
  processorId: string;
  type: OrderListType;
  status: OrderDetailStatus;
  productAmount: number;
  shippingFee: number;
  totalPrice: number;
  requestMessage: string | null;
  responseMessage: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProcessOrderResponse = {
  success: boolean;
  message: string;
  data: ProcessOrderResult;
};
