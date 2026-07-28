/** 쿼리/경로 id 파싱. 숫자가 아니면 undefined */
export function parseOptionalId(value: string | null | undefined): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
