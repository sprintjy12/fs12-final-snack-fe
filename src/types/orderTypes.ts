export type OrderListSort = "latest" | "highPrice" | "lowPrice";

export type OrderItemsSummary = {
  firstProductName: string;
  itemCount: number;
};

/** GET /api/orders 목록 한 줄 */
export type OrderListItem = {
  id: string;
  approvedAt: string;
  totalPrice: number;
  requesterName: string;
  processorName: string;
  createdAt: string;
  itemsSummary: OrderItemsSummary;
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
