"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  type HeaderNavItem,
  type HeaderProps,
} from "@/components/layout/Header";
import { Icon } from "@/components/ui";

export type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
  navItems: readonly HeaderNavItem[];
  activeHref?: string | null;
  onLogout?: HeaderProps["onLogout"];
};

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

/**
 * Mobile/Tablet 전용 사이드 메뉴 (gnb_menu).
 * Desktop(xl)에서는 Header GNB를 쓰므로 이 패널은 열리지 않습니다.
 *
 * body portal이라 열릴 때 패널로 포커스를 옮기고, 닫을 때 메뉴 버튼으로 되돌립니다.
 */
export function MobileSidebar({
  open,
  onClose,
  navItems,
  activeHref,
  onLogout,
}: MobileSidebarProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // 패널은 xl:hidden이라 Desktop에서는 안 보이지만 open이 true면
  // body 스크롤 잠금이 남습니다. 회전/리사이즈로 xl 이상이 되면 닫습니다.
  useEffect(() => {
    if (!open) {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1280px)");

    const handleBreakpointChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        onCloseRef.current();
      }
    };

    handleBreakpointChange(mediaQuery);
    mediaQuery.addEventListener("change", handleBreakpointChange);

    return () => {
      mediaQuery.removeEventListener("change", handleBreakpointChange);
    };
  }, [open]);

  useEffect(() => {
    if (!mounted || !open) {
      return;
    }

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
      // 닫기 버튼이 첫 포커스 대상입니다.
      (focusable[0] ?? panel).focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
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

  return createPortal(
    <div className="fixed inset-0 z-[101] xl:hidden" role="presentation">
      {/* 딤 오버레이 — 클릭 닫기용. AT에는 숨기고, 닫기는 X 버튼/Escape만 안내 */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 cursor-pointer bg-snack-black-500/40"
        onClick={onClose}
      />

      {/* 사이드 패널 — 시안 폭 220px, 왼쪽 고정 */}
      <nav
        ref={panelRef}
        id="mobile-sidebar"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute inset-y-0 left-0 flex w-[220px] flex-col bg-surface outline-none"
      >
        <div className="flex h-[54px] shrink-0 items-center justify-end border-b border-solid border-border px-4">
          <span id={titleId} className="sr-only">
            메뉴
          </span>
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={onClose}
            className="flex size-6 cursor-pointer items-center justify-center text-snack-black-300"
          >
            <Icon name="close" size="sm" />
          </button>
        </div>

        <ul className="flex flex-col">
          {navItems.map((item) => {
            const active = item.href === activeHref;

            return (
              <li key={`${item.href}-${item.label}`}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={onClose}
                  className={[
                    "flex w-full items-center px-5 py-6 text-base leading-[26px] font-medium",
                    active ? "text-accent" : "text-foreground-strong",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          {onLogout ? (
            <li>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex w-full cursor-pointer items-center bg-transparent px-5 py-6 text-left text-base leading-[26px] font-medium text-foreground-strong"
              >
                로그아웃
              </button>
            </li>
          ) : null}
        </ul>
      </nav>
    </div>,
    document.body,
  );
}
