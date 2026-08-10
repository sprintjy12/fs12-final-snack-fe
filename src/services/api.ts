const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080")
  .trim()
  .replace(/\/$/, "");

/** BE는 `/api/*` 아래에 마운트됨. `/products`만 오면 `/api/products`로 보정 */
const toApiPath = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/api/") || normalized === "/api") {
    return `${API_URL}${normalized}`;
  }
  return `${API_URL}/api${normalized}`;
};

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = toApiPath(path);
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${url}`);
  }

  return response.json() as Promise<T>;
};
