import { apiClient } from "@/api/core/apiClient";
import { myProfileSchema } from "@/schemas/authSchema";
import type {
  ChangeCompanyNamePayload,
  ChangeCompanyNameResult,
  ChangePasswordPayload,
  MyProfile,
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
