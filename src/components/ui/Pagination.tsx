"use client";

import { Icon } from "@/components/ui/Icon";

export type PaginationItem = string | "more";

export type PaginationProps = {
  "aria-label": string;
  items: readonly PaginationItem[];
  /** 현재 페이지 표시용 (문자열, items의 숫자 항목과 비교) */
  currentPage?: string;
  /** true면 값이 4·5인 버튼을 xl 미만에서 숨김 (구매 목록 시안). 현재 페이지는 항상 표시 */
  collapseMiddlePages?: boolean;
  className?: string;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onPageSelect?: (page: string) => void;
};

/**
 * 목록 하단 페이지네이션 UI.
 * API 연동 전에도 시안 마크업을 페이지마다 복붙하지 않도록 공통화합니다.
 */
export function Pagination({
  "aria-label": ariaLabel,
  items,
  currentPage = "1",
  collapseMiddlePages = false,
  className,
  previousDisabled = false,
  nextDisabled = false,
  onPrevious,
  onNext,
  onPageSelect,
}: PaginationProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={[
        "flex items-center justify-center gap-2 xl:gap-2.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={previousDisabled}
        onClick={onPrevious}
        className="flex size-[34px] items-center justify-center rounded-md text-snack-gray-300 disabled:cursor-not-allowed xl:size-12 xl:rounded-lg enabled:text-foreground-strong"
      >
        <Icon name="chevron-left" size="sm" />
      </button>

      <div className="flex items-center gap-1">
        {items.map((page, index) =>
          page === "more" ? (
            <span
              key={`more-${index}`}
              aria-hidden="true"
              className="flex size-[34px] items-center justify-center text-snack-gray-300 xl:size-12"
            >
              ···
            </span>
          ) : (
            <button
              key={`${page}-${index}`}
              type="button"
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => onPageSelect?.(page)}
              className={[
                "flex size-[34px] items-center justify-center rounded-md text-base leading-[26px] xl:size-12 xl:rounded-lg xl:text-lg",
                page === currentPage
                  ? "font-semibold text-foreground-strong"
                  : "font-medium text-snack-gray-300 xl:font-normal",
                collapseMiddlePages &&
                page !== currentPage &&
                (page === "4" || page === "5")
                  ? "hidden xl:flex"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        aria-label="다음 페이지"
        disabled={nextDisabled}
        onClick={onNext}
        className="flex size-[34px] items-center justify-center rounded-md text-foreground-strong disabled:cursor-not-allowed disabled:text-snack-gray-300 xl:size-12 xl:rounded-lg"
      >
        <Icon name="chevron-right" size="sm" />
      </button>
    </nav>
  );
}
