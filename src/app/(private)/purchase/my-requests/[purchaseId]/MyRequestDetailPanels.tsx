"use client";

import { useState, type ReactNode } from "react";

import { Icon } from "@/components/ui";

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
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between xl:cursor-default xl:pointer-events-none"
      >
        <h2 className="text-xl leading-8 font-semibold text-foreground-strong xl:text-2xl xl:font-bold">
          <span className="xl:hidden">{title}</span>
          <span className="hidden xl:inline">{desktopTitle ?? title}</span>
        </h2>
        <Icon
          name={open ? "chevron-up" : "chevron-down"}
          size="sm"
          className="text-snack-gray-400 xl:hidden"
        />
      </button>

      <div className="mt-3 border-t border-solid border-snack-black-100 xl:mt-4">
        <div
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

/**
 * 내 구매 요청 상세 — 요청 정보 / 요청 결과(승인 정보).
 * 모바일·태블릿에서만 접힘/펼침.
 */
export function MyRequestDetailPanels() {
  return (
    <section
      className="order-1 min-w-0 md:order-2"
      aria-label="요청 및 결과 정보"
    >
      <div className="flex flex-col px-6 py-6 md:py-0 xl:px-0">
        <AccordionSection title="요청 정보">
          <p className="text-sm leading-[26px] text-snack-gray-400 xl:text-xl xl:leading-8">
            2024. 07. 20.
          </p>
          <div>
            <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              요청인
            </h3>
            <FieldBox className="mt-4 flex h-[54px] items-center xl:h-16">
              김스낵
            </FieldBox>
          </div>
          <div>
            <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              요청 메시지
            </h3>
            <FieldBox className="mt-4 min-h-[76px] py-3 xl:min-h-20 xl:py-3.5 xl:text-lg xl:leading-[26px]">
              <span className="block">코카콜라 제로 인기가 많아요.</span>
              <span className="block">많이 주문하면 좋을 것 같아요!</span>
            </FieldBox>
          </div>
        </AccordionSection>
      </div>

      <div className="flex flex-col px-6 py-6 md:mt-0 md:py-6 xl:mt-4 xl:px-0 xl:py-0">
        <AccordionSection title="요청 결과" desktopTitle="승인 정보">
          <p className="text-sm leading-[26px] text-snack-gray-400 xl:text-xl xl:leading-8">
            2024. 07. 24.
          </p>
          <div>
            <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              담당자
            </h3>
            <FieldBox className="mt-4 flex h-[54px] items-center xl:h-16">
              김코드
            </FieldBox>
          </div>
          <div>
            <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              상태
            </h3>
            <FieldBox className="mt-4 flex h-[54px] items-center font-medium text-snack-gray-300 xl:h-16">
              구매 반려
            </FieldBox>
          </div>
          <div>
            <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              결과 메시지
            </h3>
            <FieldBox className="mt-4 min-h-[52px] py-3 xl:min-h-20 xl:py-3.5 xl:text-lg xl:leading-[26px]">
              다른 상품들도 더 추가하여 구매요청 부탁드립니다.
            </FieldBox>
          </div>
        </AccordionSection>
      </div>
    </section>
  );
}
