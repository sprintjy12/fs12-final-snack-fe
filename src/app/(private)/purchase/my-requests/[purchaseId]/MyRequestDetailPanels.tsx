"use client";

import { useId, useState, type ReactNode } from "react";

import { Icon } from "@/components/ui";
import type {
  MyOrderRequestDetailData,
  OrderDetailStatus,
} from "@/types/orderTypes";

const STATUS_LABEL: Record<OrderDetailStatus, string> = {
  PENDING: "승인 대기",
  REJECTED: "구매 반려",
  APPROVED: "승인 완료",
  CANCELLED: "요청 취소",
};

const formatDate = (iso: string | null | undefined) => {
  if (!iso) {
    return "-";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}.`;
};

type AccordionSectionProps = {
  title: string;
  desktopTitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

function AccordionSection({
  title,
  desktopTitle,
  defaultOpen = true,
  children,
}: AccordionSectionProps) {
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <h2 className="text-xl leading-8 font-semibold text-foreground-strong xl:text-2xl xl:font-bold">
        {/* 모바일·태블릿: 접힘/펼침 토글 */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full cursor-pointer items-center justify-between xl:hidden"
        >
          <span>{title}</span>
          <Icon
            name={open ? "chevron-up" : "chevron-down"}
            size="sm"
            className="text-snack-gray-400"
          />
        </button>
        {/* 데스크톱: 항상 펼침 — 토글/aria-expanded 없음 */}
        <span className="hidden xl:block">{desktopTitle ?? title}</span>
      </h2>

      <div className="mt-3 border-t border-solid border-snack-black-100 xl:mt-4">
        <div
          id={panelId}
          className={[
            "flex-col gap-3 pt-3 xl:gap-4 xl:pt-4",
            open ? "flex" : "hidden",
            "xl:flex",
          ].join(" ")}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

type FieldBoxProps = {
  children: ReactNode;
  className?: string;
};

function FieldBox({ children, className }: FieldBoxProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-solid border-border bg-surface-muted px-4 text-sm leading-6 text-foreground-muted xl:px-6 xl:text-xl xl:leading-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

type MyRequestDetailPanelsProps = {
  detail: MyOrderRequestDetailData;
};

/**
 * 내 구매 요청 상세 — 요청 정보 / 요청 결과(승인 정보).
 * 모바일·태블릿에서만 접힘/펼침.
 */
export function MyRequestDetailPanels({ detail }: MyRequestDetailPanelsProps) {
  const isPending = detail.status === "PENDING";

  return (
    <section
      className="order-1 min-w-0 md:order-2"
      aria-label="요청 및 결과 정보"
    >
      <div className="flex flex-col px-6 py-6 md:py-0 xl:px-0">
        <AccordionSection title="요청 정보">
          <p className="text-sm leading-[26px] text-snack-gray-400 xl:text-xl xl:leading-8">
            {formatDate(detail.requestedAt)}
          </p>
          <div>
            <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              요청인
            </h3>
            <FieldBox className="mt-4 flex h-[54px] items-center xl:h-16">
              {detail.requesterName || "-"}
            </FieldBox>
          </div>
          <div>
            <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              요청 메시지
            </h3>
            <FieldBox className="mt-4 min-h-[76px] whitespace-pre-line py-3 xl:min-h-20 xl:py-3.5 xl:text-lg xl:leading-[26px]">
              {detail.requestMessage || "-"}
            </FieldBox>
          </div>
        </AccordionSection>
      </div>

      <div className="flex flex-col px-6 py-6 md:mt-0 md:py-6 xl:mt-4 xl:px-0 xl:py-0">
        <AccordionSection title="요청 결과" desktopTitle="승인 정보">
          <p className="text-sm leading-[26px] text-snack-gray-400 xl:text-xl xl:leading-8">
            {formatDate(detail.approvedAt)}
          </p>
          <div>
            <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              담당자
            </h3>
            <FieldBox className="mt-4 flex h-[54px] items-center xl:h-16">
              {detail.processorName || "-"}
            </FieldBox>
          </div>
          <div>
            <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              상태
            </h3>
            <FieldBox
              className={[
                "mt-4 flex h-[54px] items-center font-medium xl:h-16",
                isPending ? "text-snack-black-100" : "text-snack-gray-300",
              ].join(" ")}
            >
              {STATUS_LABEL[detail.status]}
            </FieldBox>
          </div>
          <div>
            <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              결과 메시지
            </h3>
            <FieldBox className="mt-4 min-h-[52px] whitespace-pre-line py-3 xl:min-h-20 xl:py-3.5 xl:text-lg xl:leading-[26px]">
              {detail.responseMessage || "-"}
            </FieldBox>
          </div>
        </AccordionSection>
      </div>
    </section>
  );
}
