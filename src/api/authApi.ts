import { apiClient } from "@/api/core/apiClient";
import {
  parseAccessTokenFromBody,
  refreshAccessToken,
} from "@/api/core/refreshAccessToken";
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
 * API 호출 전 access token을 확보합니다.
 *
 * 1) 유효한 토큰이 있으면 그대로 반환
 * 2) 없거나 만료면 POST /api/auth/refresh (httpOnly 쿠키)로 재발급
 * 3) 재발급 실패 시, **개발 + NEXT_PUBLIC_ENABLE_DEV_LOGIN=true** 일 때만
 *    `/api/fe-auth/dev-login`으로 자동 발급 (로컬 편의용)
 * 4) 그 외에는 토큰을 지우고 에러
 *
 * RouteGuard의 "비로그인 → /login"과 충돌하지 않도록,
 * 기본값에서는 dev-login을 수행하지 않습니다.
 * @see src/app/api/fe-auth/dev-login/route.ts (development 외 404)
 */
export const ensureAccessToken = async () => {
  const existing = getAccessToken();
  if (existing && isAccessTokenValid(existing)) {
    return existing;
  }

  try {
    return await refreshAccessToken();
  } catch {
    // refresh 쿠키가 없거나 만료된 경우 아래로 이어갑니다.
  }

  // production/test/staging 및 플래그 미설정 시 자동 로그인 금지
  const allowDevLogin =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true";

  if (!allowDevLogin) {
    clearAccessToken();
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch("/api/fe-auth/dev-login", {
    method: "POST",
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    clearAccessToken();
    throw new Error(
      getMessageFromBody(body) ??
        "로그인이 필요합니다. .env의 DEV_LOGIN_EMAIL/PASSWORD와 백엔드 서버를 확인하세요.",
    );
  }

  const token = parseAccessTokenFromBody(body);
  if (!token) {
    clearAccessToken();
    throw new Error("로그인 응답에 accessToken이 없습니다.");
  }

  setAccessToken(token);
  return token;
};

export const login = async (payload: LoginPayload) => {
  const response = await apiClient.post<LoginResponse>("/api/auth/login", payload);
  const token = parseAccessTokenFromBody(response.data);
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

/**
 * 로그아웃 — POST /api/auth/logout
 * BE가 refreshToken DB 삭제 + refreshToken 쿠키 clearCookie 처리.
 * access token은 응답과 무관하게 항상 제거합니다.
 * @see fs12-final-snack-be/src/controllers/authController.ts
 */
export const logout = async () => {
  try {
    await apiClient.post("/api/auth/logout");
  } catch {
    // 이미 폐기된 refreshToken 등이어도 클라이언트 정리는 계속합니다.
  } finally {
    clearAccessToken();
  }
};
