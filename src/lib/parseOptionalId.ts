/** 쿼리/경로 id 파싱. 정수 패턴이 아니면 undefined */
export function parseOptionalId(
  value: string | null | undefined,
): number | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (trimmed === "" || !/^\d+$/.test(trimmed)) return undefined;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}
