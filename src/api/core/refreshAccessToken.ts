import axios from "axios";

import {
  ACCESS_TOKEN_KEY,
  getAccessToken,
  isAccessTokenValid,
  setAccessToken,
} from "@/lib/authStorage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const REFRESH_LOCK_NAME = "snack-auth-refresh";
const REFRESH_LOCK_KEY = "snack_refresh_lock";
const LOGOUT_SIGNAL_KEY = "snack_auth_logout_signal";
const REFRESH_LOCK_TTL_MS = 12_000;
const REFRESH_LOCK_POLL_MS = 50;
const REFRESH_LOCK_VERIFY_MS = 20;

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

type StorageLock = {
  owner: string;
  at: number;
};

/** 로그아웃 이후 늦게 도착한 refresh 결과를 폐기하기 위한 오류입니다. */
export class AuthSessionInvalidatedError extends Error {
  constructor() {
    super("로그아웃되어 토큰을 재발급하지 않습니다.");
    this.name = "AuthSessionInvalidatedError";
  }
}

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

let authGeneration = 0;
let loggedOut = false;
let refreshAbortController: AbortController | null = null;
let inFlightRefresh: Promise<string> | null = null;
let didBindStorageListener = false;

export const getAuthGeneration = () => authGeneration;

export const isAuthSessionInvalidated = () => loggedOut;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const broadcastLogoutSignal = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LOGOUT_SIGNAL_KEY, String(Date.now()));
  } catch {
    // private mode 등에서 실패해도 같은 탭 invalidate는 이미 적용됩니다.
  }
};

/**
 * 진행 중 refresh를 취소하고, 이후 setAccessToken이 일어나지 않게 합니다.
 * 로그아웃·세션 정리 시 토큰을 지우기 **전에** 호출해야 합니다.
 */
export const invalidateAuthSession = (options?: { broadcast?: boolean }) => {
  loggedOut = true;
  authGeneration += 1;
  refreshAbortController?.abort();

  if (options?.broadcast !== false) {
    broadcastLogoutSignal();
  }
};

/** 로그인 성공 시 호출. 이전 세션의 in-flight refresh가 새 토큰을 덮지 않습니다. */
export const beginAuthSession = () => {
  loggedOut = false;
  authGeneration += 1;
  refreshAbortController?.abort();
};

const handleAuthStorageEvent = (event: StorageEvent) => {
  if (event.key === LOGOUT_SIGNAL_KEY && event.newValue) {
    invalidateAuthSession({ broadcast: false });
    return;
  }

  if (event.key !== ACCESS_TOKEN_KEY) {
    return;
  }

  if (event.newValue === null) {
    invalidateAuthSession({ broadcast: false });
    return;
  }

  // 다른 탭이 로그인·refresh로 새 토큰을 저장함. 불필요한 refresh를 막기 위해
  // loggedOut만 해제하고, in-flight는 abort하지 않습니다. (락 대기 후 토큰 재사용)
  loggedOut = false;
};

const bindAuthStorageListener = () => {
  if (didBindStorageListener || typeof window === "undefined") {
    return;
  }

  didBindStorageListener = true;
  window.addEventListener("storage", handleAuthStorageEvent);
};

bindAuthStorageListener();

const readRefreshLock = (): StorageLock | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(REFRESH_LOCK_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StorageLock;
    if (
      !parsed ||
      typeof parsed.owner !== "string" ||
      typeof parsed.at !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const releaseRefreshLock = (owner: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = readRefreshLock();
    if (current?.owner === owner) {
      window.localStorage.removeItem(REFRESH_LOCK_KEY);
    }
  } catch {
    // ignore
  }
};

const acquireRefreshLock = async (owner: string): Promise<boolean> => {
  if (typeof window === "undefined") {
    return true;
  }

  const now = Date.now();
  const current = readRefreshLock();
  if (
    current &&
    current.owner !== owner &&
    now - current.at < REFRESH_LOCK_TTL_MS
  ) {
    return false;
  }

  const next: StorageLock = { owner, at: now };
  try {
    window.localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify(next));
  } catch {
    return false;
  }

  await sleep(REFRESH_LOCK_VERIFY_MS);

  if (loggedOut) {
    releaseRefreshLock(owner);
    return false;
  }

  return readRefreshLock()?.owner === owner;
};

/**
 * 탭 간 refresh를 한 번에 하나만 수행합니다.
 * Web Locks가 있으면 브라우저가 탭 종료 시 락을 해제합니다.
 * 없으면 localStorage 락 + TTL로 영구 lock-out을 방지합니다.
 */
const withCrossTabRefreshLock = async (
  run: () => Promise<string>,
  signal: AbortSignal,
): Promise<string> => {
  if (typeof navigator !== "undefined" && navigator.locks?.request) {
    try {
      return await navigator.locks.request(
        REFRESH_LOCK_NAME,
        { signal },
        () => run(),
      );
    } catch (error) {
      if (signal.aborted || loggedOut) {
        throw new AuthSessionInvalidatedError();
      }
      throw error;
    }
  }

  const owner = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const deadline = Date.now() + REFRESH_LOCK_TTL_MS;

  while (Date.now() < deadline) {
    if (signal.aborted || loggedOut) {
      throw new AuthSessionInvalidatedError();
    }

    const existing = getAccessToken();
    if (existing && isAccessTokenValid(existing)) {
      return existing;
    }

    if (await acquireRefreshLock(owner)) {
      try {
        const latest = getAccessToken();
        if (latest && isAccessTokenValid(latest)) {
          return latest;
        }
        return await run();
      } finally {
        releaseRefreshLock(owner);
      }
    }

    await sleep(REFRESH_LOCK_POLL_MS);
  }

  if (signal.aborted || loggedOut) {
    throw new AuthSessionInvalidatedError();
  }

  const existing = getAccessToken();
  if (existing && isAccessTokenValid(existing)) {
    return existing;
  }

  return run();
};

const assertSessionAlive = (generation: number, signal: AbortSignal) => {
  if (loggedOut || generation !== authGeneration || signal.aborted) {
    throw new AuthSessionInvalidatedError();
  }
};

const requestNewAccessToken = async (
  generation: number,
  signal: AbortSignal,
): Promise<string> => {
  assertSessionAlive(generation, signal);

  const existing = getAccessToken();
  if (existing && isAccessTokenValid(existing)) {
    return existing;
  }

  try {
    const response = await refreshClient.post<RefreshResponse>(
      "/api/auth/refresh",
      undefined,
      { signal },
    );

    assertSessionAlive(generation, signal);

    const token = parseAccessTokenFromBody(response.data);
    if (!token) {
      throw new Error("토큰 재발급 응답에 accessToken이 없습니다.");
    }

    // setAccessToken 직전에도 한 번 더 확인 — await 이후 로그아웃이 끼어든 경우
    assertSessionAlive(generation, signal);
    setAccessToken(token);
    return token;
  } catch (error) {
    if (loggedOut || generation !== authGeneration || signal.aborted) {
      throw new AuthSessionInvalidatedError();
    }
    throw error;
  }
};

/**
 * POST /api/auth/refresh — httpOnly refreshToken 쿠키로 access token 재발급.
 * 같은 탭의 동시 호출은 Promise로 합치고, 다른 탭과는 Web Locks(또는 storage lock)로 직렬화합니다.
 */
export const refreshAccessToken = (): Promise<string> => {
  if (loggedOut) {
    return Promise.reject(new AuthSessionInvalidatedError());
  }

  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  const existing = getAccessToken();
  if (existing && isAccessTokenValid(existing)) {
    return Promise.resolve(existing);
  }

  const generation = authGeneration;
  const controller = new AbortController();
  refreshAbortController = controller;

  inFlightRefresh = (async () => {
    return withCrossTabRefreshLock(
      () => requestNewAccessToken(generation, controller.signal),
      controller.signal,
    );
  })().finally(() => {
    if (refreshAbortController === controller) {
      refreshAbortController = null;
    }
    inFlightRefresh = null;
  });

  return inFlightRefresh;
};
