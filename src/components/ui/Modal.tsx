"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

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
    "flex h-[54px] w-full cursor-pointer items-center justify-center rounded-2xl p-4 text-base leading-[26px] font-semibold md:h-16 md:w-[310px] md:text-xl md:leading-8",
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) {
    return null;
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose?.();
    }
  };

  const actions = [secondaryAction, primaryAction].filter(
    (action): action is ModalAction => Boolean(action),
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-snack-black-500/40 px-0 md:items-center md:px-6"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="flex w-full max-w-[375px] flex-col items-center gap-[26px] rounded-t-[32px] bg-surface-muted px-6 py-8 shadow-[4px_4px_5px_rgba(169,169,169,0.2)] md:max-w-[704px] md:gap-12 md:rounded-[32px] md:px-8 md:pt-12 md:pb-10"
      >
        <div className="flex w-full flex-col items-center gap-4 md:gap-6">
          {illustration ? (
            <div className="flex h-[148px] w-[184px] items-center justify-center md:h-[190px] md:w-[260px]">
              {illustration}
            </div>
          ) : null}

          <div className="flex w-full flex-col items-center gap-4 md:gap-6">
            <h2
              id={titleId}
              className="text-center text-xl leading-8 font-bold text-foreground-strong md:text-2xl"
            >
              {title}
            </h2>

            {description ? (
              <div
                id={descriptionId}
                className="text-center text-sm leading-6 font-medium text-snack-gray-400 md:text-xl md:leading-8"
              >
                {description}
              </div>
            ) : null}
          </div>
        </div>

        {actions.length > 0 ? (
          <div className="flex w-full flex-col-reverse gap-4 md:flex-row md:justify-between md:gap-5">
            {actions.map((action) => (
              <ModalActionButton
                key={`${action.variant ?? "primary"}-${action.label}`}
                action={action}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
