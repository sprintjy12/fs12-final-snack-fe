import type { PaginationItem } from "@/components/ui/Pagination";

/**
 * 현재 페이지 주변 숫자가 보이도록 페이지 배열을 만듭니다.
 * 예: 1 … 9 10 11 … 73
 */
export function buildPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 0) {
    return ["1"];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => String(index + 1));
  }

  const safeCurrent = Math.min(Math.max(currentPage, 1), totalPages);
  const items: PaginationItem[] = ["1"];

  // 현재 페이지 기준 좌우 1칸 → 최대 5개 숫자 + … 형태
  let start = Math.max(2, safeCurrent - 1);
  let end = Math.min(totalPages - 1, safeCurrent + 1);

  if (safeCurrent <= 3) {
    start = 2;
    end = 4;
  } else if (safeCurrent >= totalPages - 2) {
    start = totalPages - 3;
    end = totalPages - 1;
  }

  if (start > 2) {
    items.push("more");
  }

  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    items.push(String(pageNumber));
  }

  if (end < totalPages - 1) {
    items.push("more");
  }

  items.push(String(totalPages));
  return items;
}
