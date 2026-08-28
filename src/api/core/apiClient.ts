import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  getAuthGeneration,
  isAuthSessionInvalidated,
  refreshAccessToken,
} from "@/api/core/refreshAccessToken";
import { clearAccessToken, getAccessToken } from "@/lib/authStorage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const shouldSkipAuthRefresh = (url: string | undefined) => {
  if (!url) {
    return false;
  }

  return (
    url.includes("/api/auth/login") ||
    url.includes("/api/auth/logout") ||
    url.includes("/api/auth/refresh") ||
    url.includes("/api/auth/super-admin/signup")
  );
};

export const apiClient = axios.create({
  baseURL: API_URL,
  // 백엔드가 응답하지 않는 경우 요청이 무한정 대기하지 않도록
  // 공통 timeout을 설정합니다.
  // 파일 업로드처럼 오래 걸리는 요청은
  // 요청별 timeout 옵션으로 재정의할 수 있습니다.
  timeout: 10_000,
  // refreshToken httpOnly 쿠키를 받기/보내기 위해 필요 (CORS credentials)
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequestConfig | undefined;

    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry ||
      shouldSkipAuthRefresh(original.url)
    ) {
      return Promise.reject(error);
    }

    const sessionAt401 = getAuthGeneration();
    original._retry = true;

    try {
      const token = await refreshAccessToken();
      if (
        isAuthSessionInvalidated() ||
        getAuthGeneration() !== sessionAt401
      ) {
        return Promise.reject(error);
      }

      original.headers.Authorization = `Bearer ${token}`;
      return apiClient.request(original);
    } catch {
      if (
        !isAuthSessionInvalidated() &&
        getAuthGeneration() === sessionAt401
      ) {
        clearAccessToken();
      }
      return Promise.reject(error);
    }
  },
);
