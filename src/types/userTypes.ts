/** BE UserRole */
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export type UserStatus = "ACTIVE" | "INACTIVE" | "WITHDRAWN" | string;

/** GET /api/users/me data */
export type MyProfile = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  company: {
    id: string;
    name: string;
  };
};

/**
 * 프로필 변경 폼.
 * Figma: companyName(최고관리자) + password + passwordConfirm
 * BE password API는 currentPassword도 요구 → currentPassword 포함
 */
export type ProfileForm = {
  companyName: string;
  currentPassword: string;
  password: string;
  passwordConfirm: string;
};

export type ProfileFormErrors = Partial<Record<keyof ProfileForm, string>>;

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type ChangeCompanyNamePayload = {
  companyName: string;
};

export type ChangeCompanyNameResult = {
  id: string;
  name: string;
};

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

/** DELETE /api/users/:userId */
export type WithdrawUserResponse = {
  message: string;
};

/** PATCH /api/users/:userId/role — SUPER_ADMIN으로 변경 불가 */
export type UpdateUserRoleApiRole = "USER" | "ADMIN";

export type UpdateUserRolePayload = {
  role: UpdateUserRoleApiRole;
};

export type UpdateUserRoleResult = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserApiRole;
  status: string;
};

export type UpdateUserRoleResponse = {
  message: string;
  data: UpdateUserRoleResult;
};
