"use client";

import { useId, useRef, useState } from "react";

import { Icon } from "@/components/ui";
import { useOutsideDismiss } from "@/hooks/useOutsideDismiss";

type MemberMenuProps = {
  memberName: string;
  onChangeRole?: () => void;
  onWithdraw?: () => void;
};

export function MemberMenu({
  memberName,
  onChangeRole,
  onWithdraw,
}: MemberMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideDismiss(containerRef, {
    enabled: open,
    onDismiss: () => setOpen(false),
  });

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-label={`${memberName} 메뉴`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((previous) => !previous)}
        className="flex size-6 cursor-pointer items-center justify-center text-snack-gray-400"
      >
        <Icon name="kebab-menu" size="sm" />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={`${memberName} 작업`}
          className="absolute top-8 right-0 z-20 w-24 overflow-hidden rounded-lg bg-surface shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
        >
          <button
            type="button"
            role="menuitem"
            className="flex h-11 w-full cursor-pointer items-center justify-center bg-transparent text-sm leading-6 font-medium text-snack-black-200"
            onClick={() => {
              setOpen(false);
              onWithdraw?.();
            }}
          >
            계정 탈퇴
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex h-11 w-full cursor-pointer items-center justify-center bg-transparent text-sm leading-6 font-medium text-snack-black-200"
            onClick={() => {
              setOpen(false);
              onChangeRole?.();
            }}
          >
            권한 변경
          </button>
        </div>
      ) : null}
    </div>
  );
}
