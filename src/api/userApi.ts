import { apiClient } from "@/api/core/apiClient";
import type {
  GetUsersParams,
  UpdateUserRolePayload,
  UpdateUserRoleResponse,
  UserListResponse,
  WithdrawUserResponse,
} from "@/types/userTypes";

/**
 * 회원 목록 API.
 * 화면 상태/캐시는 Hook에서 처리합니다.
 */
export const getUsers = async (
  params: GetUsersParams = {},
): Promise<UserListResponse> => {
  const name = params.name?.trim();

  const response = await apiClient.get<UserListResponse>("/api/users", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      ...(name ? { name } : {}),
    },
  });

  return response.data;
};

/** 회원 강제 탈퇴 */
export const withdrawUser = async (
  userId: string,
): Promise<WithdrawUserResponse> => {
  const response = await apiClient.delete<WithdrawUserResponse>(
    `/api/users/${userId}`,
  );

  return response.data;
};

/** 회원 권한 변경 — PATCH /api/users/:userId/role */
export const updateUserRole = async (
  userId: string,
  payload: UpdateUserRolePayload,
): Promise<UpdateUserRoleResponse> => {
  const response = await apiClient.patch<UpdateUserRoleResponse>(
    `/api/users/${userId}/role`,
    payload,
  );

  return response.data;
};
