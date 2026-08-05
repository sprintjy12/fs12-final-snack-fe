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
