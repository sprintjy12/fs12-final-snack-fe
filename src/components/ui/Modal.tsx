"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";

import { ModalShell } from "@/components/ui/ModalShell";

/**
 * Modal — 일러스트 확인/결과 안내 모달입니다.
 *
 * 리팩터 메모:
 * - 오버레이·Esc·스크롤 잠금은 `ModalShell`로 옮겼습니다.
 * - 이 컴포넌트는 "강아지 일러스트 + 제목 + 설명 + 버튼" 패턴만 유지합니다.
 * - 회원 초대처럼 폼이 있는 모달은 이 API를 억지로 확장하지 말고
 *   `ModalShell` 위에 폼 UI를 따로 구성하세요. (`/modal-sample` 참고)
 *
 * 호출 API(`title` / `illustration` / `primaryAction` 등)는 기존과 동일합니다.
 */
export type ModalAction = {
  label: string;
  /** 클릭 시 실행할 페이지별 핸들러 (API 호출, 상태 변경 등) */
  onClick?: () => void;
  /**
   * 이동이 필요할 때 사용.
   * href가 있으면 Link로 렌더되고, onClick이 함께 있으면 이동 전에 실행됩니다.
   */
  href?: string;
  variant?: "primary" | "secondary";
};

export type ModalProps = {
  open: boolean;
  onClose?: () => void;
  title: string;
  description?: ReactNode;
  illustration?: ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  closeOnOverlayClick?: boolean;
};

function ModalActionButton({ action }: { action: ModalAction }) {
  const isPrimary = action.variant !== "secondary";
  const className = [
    // Desktop(xl)만 가로형 CTA. Tablet/Mobile은 시안 sm(375) 세로 스택
    "flex h-[54px] w-full cursor-pointer items-center justify-center rounded-2xl p-4 text-base leading-[26px] font-semibold xl:h-16 xl:w-[310px] xl:text-xl xl:leading-8",
    isPrimary
      ? "bg-accent text-surface"
      : "bg-snack-background-500 text-accent",
  ].join(" ");

  if (action.href) {
    return (
      <Link href={action.href} onClick={action.onClick} className={className}>
        {action.label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  illustration,
  primaryAction,
  secondaryAction,
  closeOnOverlayClick = true,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const actions = [secondaryAction, primaryAction].filter(
    (action): action is ModalAction => Boolean(action),
  );

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      closeOnOverlayClick={closeOnOverlayClick}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="flex max-w-[375px] flex-col items-center gap-8 px-6 py-8 xl:max-w-[704px] xl:gap-12 xl:px-8 xl:pt-12 xl:pb-10"
    >
      <div className="flex w-full flex-col items-center gap-4 xl:gap-6">
        {illustration ? (
          <div className="flex h-[160px] w-[180px] items-center justify-center xl:h-[190px] xl:w-[260px]">
            {illustration}
          </div>
        ) : null}

        <div className="flex w-full flex-col items-center gap-4 xl:gap-6">
          <h2
            id={titleId}
            className="text-center text-xl leading-8 font-bold text-foreground-strong xl:text-2xl"
          >
            {title}
          </h2>

          {description ? (
            <div
              id={descriptionId}
              className="text-center text-sm leading-6 font-medium text-snack-gray-400 xl:text-xl xl:leading-8"
            >
              {description}
            </div>
          ) : null}
        </div>
      </div>

      {actions.length > 0 ? (
        <div className="flex w-full flex-col-reverse gap-4 xl:flex-row xl:justify-between xl:gap-5">
          {actions.map((action) => (
            <ModalActionButton
              key={`${action.variant ?? "primary"}-${action.label}`}
              action={action}
            />
          ))}
        </div>
      ) : null}
    </ModalShell>
  );
}
