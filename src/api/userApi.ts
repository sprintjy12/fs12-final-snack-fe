import { apiClient } from "@/api/core/apiClient";
import type { GetUsersParams, UserListResponse } from "@/types/userTypes";

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
