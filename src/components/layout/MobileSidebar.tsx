"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
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

/**
 * Mobile/Tablet 전용 사이드 메뉴 (gnb_menu).
 * Desktop(xl)에서는 Header GNB를 쓰므로 이 패널은 열리지 않습니다.
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
        onClose();
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

  return createPortal(
    <div className="fixed inset-0 z-50 xl:hidden" role="presentation">
      {/* 딤 오버레이 */}
      <button
        type="button"
        aria-label="메뉴 닫기"
        className="absolute inset-0 cursor-pointer bg-snack-black-500/40"
        onClick={onClose}
      />

      {/* 사이드 패널 — 시안 폭 220px, 왼쪽 고정 */}
      <nav
        id="mobile-sidebar"
        aria-labelledby={titleId}
        className="absolute inset-y-0 left-0 flex w-[220px] flex-col bg-surface"
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
          <li>
            <button
              type="button"
              onClick={() => {
                onLogout?.();
                onClose();
              }}
              className="flex w-full cursor-pointer items-center bg-transparent px-5 py-6 text-left text-base leading-[26px] font-medium text-foreground-strong"
            >
              로그아웃
            </button>
          </li>
        </ul>
      </nav>
    </div>,
    document.body,
  );
}
