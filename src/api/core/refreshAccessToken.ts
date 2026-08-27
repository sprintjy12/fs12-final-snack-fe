import axios from "axios";

import { setAccessToken } from "@/lib/authStorage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * refresh 전용 클라이언트.
 * apiClient 인터셉터를 타면 401 재발급 루프가 생기므로 분리합니다.
 * refreshToken 쿠키 path가 `/api/auth`라 URL도 이 prefix여야 합니다.
 */
const refreshClient = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RefreshResponse = {
  message: string;
  data: {
    accessToken: string;
  };
};

/** 로그인·재발급 JSON에서 비어 있지 않은 accessToken만 꺼냅니다. */
export const parseAccessTokenFromBody = (body: unknown): string | null => {
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

let inFlightRefresh: Promise<string> | null = null;

/**
 * POST /api/auth/refresh — httpOnly refreshToken 쿠키로 access token 재발급.
 * 동시 호출은 한 번의 요청으로 합칩니다. (BE가 refresh token을 회전함)
 */
export const refreshAccessToken = (): Promise<string> => {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  inFlightRefresh = (async () => {
    const response = await refreshClient.post<RefreshResponse>(
      "/api/auth/refresh",
    );
    const token = parseAccessTokenFromBody(response.data);
    if (!token) {
      throw new Error("토큰 재발급 응답에 accessToken이 없습니다.");
    }

    setAccessToken(token);
    return token;
  })().finally(() => {
    inFlightRefresh = null;
  });

  return inFlightRefresh;
};
