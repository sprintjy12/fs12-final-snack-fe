const ACCESS_TOKEN_KEY = "snack_access_token";

/** 브라우저에 저장된 access token을 읽습니다. */
export const getAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

/** 로그인 성공 후 access token을 저장합니다. */
export const setAccessToken = (token: string) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/** 로그아웃 시 access token을 제거합니다. */
export const clearAccessToken = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
};

/**
 * JWT exp를 클라이언트에서만 확인합니다. (서명 검증 없음)
 * 만료·파싱 실패 시 false → 재로그인 유도.
 */
export const isAccessTokenValid = (token: string) => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return false;
    }

    const payload = JSON.parse(
      atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };

    if (typeof payload.exp !== "number") {
      return false;
    }

    // 만료 직전 재발급을 위해 30초 여유
    return payload.exp * 1000 > Date.now() + 30_000;
  } catch {
    return false;
  }
};
