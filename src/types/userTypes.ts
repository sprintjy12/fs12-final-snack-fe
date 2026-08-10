/** BE UserRole — SUPER_ADMIN | ADMIN | USER */
export type UserApiRole = "SUPER_ADMIN" | "ADMIN" | "USER";

/** GET /api/users 목록 한 줄 */
export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: UserApiRole;
};

export type UserListPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type UserListResponse = {
  message: string;
  data: UserListItem[];
  pagination: UserListPagination;
};

export type GetUsersParams = {
  page?: number;
  limit?: number;
  /** 이름 검색 — 없으면 쿼리에서 제외 */
  name?: string;
};
