import { apiClient } from "@/api/core/apiClient";
import {
  clearAccessToken,
  getAccessToken,
  isAccessTokenValid,
  setAccessToken,
} from "@/lib/authStorage";
import { invitationVerifyDataSchema } from "@/schemas/authSchema";
import type {
  CreateInvitationPayload,
  CreateInvitationResult,
  InvitationVerifyData,
  InvitedSignupPayload,
  LoginPayload,
  SuperAdminSignupPayload,
} from "@/types/authTypes";

type LoginResponse = {
  message: string;
  data: {
    accessToken: string;
    user: {
      id: string;
      companyId: string;
      name: string;
      email: string;
      role: string;
      status: string;
    };
  };
};

/** 로그인 JSON에서 비어 있지 않은 accessToken만 꺼냅니다. */
const getAccessTokenFromLoginBody = (body: unknown): string | null => {
  if (!body || typeof body !== "object") {
    return null;
  }

  if (!("data" in body)) {
    return null;
  }

  const { data } = body as { data: unknown };
  if (!data || typeof data !== "object") {
    return null;
  }

  if (!("accessToken" in data)) {
    return null;
  }

  const { accessToken } = data as { accessToken: unknown };
  if (typeof accessToken !== "string" || accessToken.trim() === "") {
    return null;
  }

  return accessToken;
};

const getMessageFromBody = (body: unknown): string | undefined => {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  if (!("message" in body)) {
    return undefined;
  }

  const { message } = body as { message: unknown };
  if (typeof message !== "string" || message.trim() === "") {
    return undefined;
  }

  return message;
};

/**
 * 로그인 페이지 연동 전, 로컬 API 호출용 세션을 확보합니다.
 * 서버 전용 DEV_LOGIN_* 로 백엔드 로그인을 대행하고 token만 브라우저에 저장합니다.
 * (비밀번호는 NEXT_PUBLIC이 아니라 서버 .env에만 둡니다.)
 * 액세스 토큰은 백엔드 기준 15분 만료라, 만료·무효면 다시 발급합니다.
 */
export const ensureAccessToken = async () => {
  const existing = getAccessToken();
  if (existing && isAccessTokenValid(existing)) {
    return existing;
  }

  if (existing) {
    clearAccessToken();
  }

  const response = await fetch("/api/fe-auth/dev-login", {
    method: "POST",
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getMessageFromBody(body) ??
        "로그인이 필요합니다. .env의 DEV_LOGIN_EMAIL/PASSWORD와 백엔드 서버를 확인하세요.",
    );
  }

  const token = getAccessTokenFromLoginBody(body);
  if (!token) {
    throw new Error("로그인 응답에 accessToken이 없습니다.");
  }

  setAccessToken(token);
  return token;
};

export const login = async (payload: LoginPayload) => {
  const response = await apiClient.post<LoginResponse>("/api/auth/login", payload);
  const token = getAccessTokenFromLoginBody(response.data);
  if (!token) {
    throw new Error("로그인 응답에 accessToken이 없습니다.");
  }

  setAccessToken(token);
  return response.data;
};

type SuperAdminSignupResponse = {
  message: string;
  data: {
    company: {
      id: string;
      name: string;
      businessNumber: string;
      createdAt: string;
    };
    user: {
      id: string;
      companyId: string;
      name: string;
      email: string;
      role: string;
      status: string;
      createdAt: string;
    };
  };
};

/** 기업 담당자(최고 관리자) 회원가입 — POST /api/auth/super-admin/signup */
export const signupSuperAdmin = async (payload: SuperAdminSignupPayload) => {
  const response = await apiClient.post<SuperAdminSignupResponse>(
    "/api/auth/super-admin/signup",
    payload,
  );

  return response.data;
};

type VerifyInvitationResponse = {
  message: string;
  data: InvitationVerifyData;
};

type InvitedSignupResponse = {
  message: string;
  data: {
    id: string;
    companyId: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  };
};

/** 초대 토큰 검증 — GET /api/invitations/verify */
export const verifyInvitation = async (
  token: string,
): Promise<InvitationVerifyData> => {
  const response = await apiClient.get<VerifyInvitationResponse>(
    "/api/invitations/verify",
    { params: { token } },
  );

  const parsed = invitationVerifyDataSchema.safeParse(response.data.data);
  if (!parsed.success) {
    throw new Error("초대 정보 응답 형식이 올바르지 않습니다.");
  }

  return parsed.data;
};

/** 초대 회원가입 — POST /api/invitations/signup */
export const signupInvitedUser = async (payload: InvitedSignupPayload) => {
  const response = await apiClient.post<InvitedSignupResponse>(
    "/api/invitations/signup",
    payload,
  );

  return response.data;
};

type CreateInvitationResponse = {
  message: string;
  data: CreateInvitationResult;
};

/** 회원 초대 생성 — POST /api/invitations (SUPER_ADMIN) */
export const createInvitation = async (payload: CreateInvitationPayload) => {
  const response = await apiClient.post<CreateInvitationResponse>(
    "/api/invitations",
    payload,
  );

  return response.data.data;
};
