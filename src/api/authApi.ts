import { apiClient } from "@/api/core/apiClient";
import { getAccessToken, setAccessToken } from "@/lib/authStorage";

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

/**
 * 로그인 페이지 연동 전, 로컬 API 호출용 세션을 확보합니다.
 * 서버 전용 DEV_LOGIN_* 로 백엔드 로그인을 대행하고 token만 브라우저에 저장합니다.
 * (비밀번호는 NEXT_PUBLIC이 아니라 서버 .env에만 둡니다.)
 */
export const ensureAccessToken = async () => {
  const existing = getAccessToken();
  if (existing) {
    return existing;
  }

  const response = await fetch("/api/fe-auth/dev-login", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("로그인이 필요합니다. .env의 DEV_LOGIN_EMAIL/PASSWORD를 확인하세요.");
  }

  const body = (await response.json()) as LoginResponse;
  const token = body.data.accessToken;
  setAccessToken(token);
  return token;
};

export const login = async (payload: {
  email: string;
  password: string;
}) => {
  const response = await apiClient.post<LoginResponse>("/api/auth/login", payload);
  setAccessToken(response.data.data.accessToken);
  return response.data;
};
