import { apiClient } from "@/api/core/apiClient";
import {
  clearAccessToken,
  getAccessToken,
  isAccessTokenValid,
  setAccessToken,
} from "@/lib/authStorage";
import type {
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
