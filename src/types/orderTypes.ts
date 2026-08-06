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
