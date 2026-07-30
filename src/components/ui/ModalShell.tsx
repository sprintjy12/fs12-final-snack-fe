"use client";

import {
  useEffect,
  useRef,
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
 * - 그래서 오버레이·portal·Esc·스크롤 잠금·포커스만 `ModalShell`로 공통화하고,
 *   안의 내용은 `Modal`(확인) / 도메인 폼 모달처럼 따로 구성합니다.
 *
 * 모달이 열리면 진행 중인 토스트를 닫습니다.
 * (성공 토스트와 확인 모달이 겹치면 초점이 분산되기 때문)
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.tabIndex !== -1,
  );

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
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // portal이 실제로 그려진 뒤에만 포커스/트랩을 겁니다.
    if (!mounted || !open) {
      return;
    }

    dismissToast();

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      const focusable = getFocusableElements(panel);
      (focusable[0] ?? panel).focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      const focusable = getFocusableElements(panel);

      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last || !panel.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [mounted, open]);

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
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        className={[DEFAULT_PANEL_CLASS_NAME, className]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
