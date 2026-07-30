"use client";

import {
  useEffect,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { dismissToast } from "@/components/ui/Toast";

/**
 * ModalShell — 모달의 "껍데기"만 담당합니다.
 *
 * 왜 분리했나?
 * - 기존 `Modal`은 일러스트 확인/결과 안내용이라 레이아웃이 고정되어 있습니다.
 * - 회원 초대처럼 입력 폼이 있는 모달은 시안 구조가 완전히 달라
 *   같은 컴포넌트에 props를 계속 추가하면 API가 비대해집니다.
 * - 그래서 오버레이·portal·Esc·스크롤 잠금만 `ModalShell`로 공통화하고,
 *   안의 내용은 `Modal`(확인) / 도메인 폼 모달처럼 따로 구성합니다.
 *
 * 모달이 열리면 진행 중인 토스트를 닫습니다.
 * (성공 토스트와 확인 모달이 겹치면 초점이 분산되기 때문)
 */
export type ModalShellProps = {
  open: boolean;
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
  /** dialog 제목 요소 id (접근성) */
  "aria-labelledby"?: string;
  /** dialog 설명 요소 id (접근성) */
  "aria-describedby"?: string;
  /**
   * 패널(카드) 레이아웃/패딩 클래스.
   * 확인 모달·폼 모달마다 시안이 다르므로 호출부에서 맞춥니다.
   */
  className?: string;
  children: ReactNode;
};

const DEFAULT_PANEL_CLASS_NAME = [
  "w-full bg-surface-muted",
  "shadow-[4px_4px_5px_rgba(169,169,169,0.2)]",
  "rounded-t-[32px] md:rounded-[32px]",
].join(" ");

export function ModalShell({
  open,
  onClose,
  closeOnOverlayClick = true,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  className,
  children,
}: ModalShellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    dismissToast();

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

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-snack-black-500/40 px-0 md:items-center md:px-6"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        className={[DEFAULT_PANEL_CLASS_NAME, className].filter(Boolean).join(" ")}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
