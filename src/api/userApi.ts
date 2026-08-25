import { apiClient } from "@/api/core/apiClient";
import { myProfileSchema } from "@/schemas/authSchema";
import type {
  ChangeCompanyNamePayload,
  ChangeCompanyNameResult,
  ChangePasswordPayload,
  GetUsersParams,
  MyProfile,
  UpdateUserRolePayload,
  UpdateUserRoleResponse,
  RestoreUserResponse,
  UserListResponse,
  WithdrawUserResponse,
} from "@/types/userTypes";

type MyProfileResponse = {
  message: string;
  data: MyProfile;
};

type ChangeCompanyNameResponse = {
  message: string;
  data: ChangeCompanyNameResult;
};

type ChangePasswordResponse = {
  message: string;
};

/** 내 정보 조회 — GET /api/users/me */
export const getMyProfile = async (): Promise<MyProfile> => {
  const response = await apiClient.get<MyProfileResponse>("/api/users/me");

  const parsed = myProfileSchema.safeParse(response.data.data);
  if (!parsed.success) {
    throw new Error("내 정보 응답 형식이 올바르지 않습니다.");
  }

  return parsed.data;
};

/** 비밀번호 변경 — PATCH /api/users/me/password */
export const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await apiClient.patch<ChangePasswordResponse>(
    "/api/users/me/password",
    payload,
  );

  return response.data;
};

/** 회사명 변경 — PATCH /api/users/me/company (SUPER_ADMIN) */
export const changeCompanyName = async (
  payload: ChangeCompanyNamePayload,
): Promise<ChangeCompanyNameResult> => {
  const response = await apiClient.patch<ChangeCompanyNameResponse>(
    "/api/users/me/company",
    payload,
  );

  return response.data.data;
};

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

// ===해당부분 현재 수정===
/** 회원 복구 — PATCH /api/users/:userId/restore */
export const restoreUser = async (
  userId: string,
): Promise<RestoreUserResponse> => {
  const response = await apiClient.patch<RestoreUserResponse>(
    `/api/users/${userId}/restore`,
  );

  return response.data;
};
// ==================

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
