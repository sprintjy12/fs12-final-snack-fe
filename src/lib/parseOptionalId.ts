/** 쿼리/경로 id 파싱. mock 숫자 id 또는 BE uuid */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function parseRouteId(
  value: string | null | undefined,
): number | string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (trimmed === "") return undefined;

  if (/^\d+$/.test(trimmed)) {
    const parsed = Number(trimmed);
    return Number.isSafeInteger(parsed) ? parsed : undefined;
  }

  if (isUuid(trimmed)) return trimmed;
  return undefined;
}

/** @deprecated 상품 필터는 parseRouteId 사용. 숫자 전용 호환용 */
export function parseOptionalId(
  value: string | null | undefined,
): number | undefined {
  const parsed = parseRouteId(value);
  return typeof parsed === "number" ? parsed : undefined;
}
