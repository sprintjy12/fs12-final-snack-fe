"use client";

import { useId, useRef, useState } from "react";

import { Icon } from "@/components/ui";
import { useOutsideDismiss } from "@/hooks/useOutsideDismiss";

type ProductMineMenuProps = {
  productName: string;
  onEdit: () => void;
  onDelete: () => void;
  /** Figma kebab-menu: sm=모바일, md=데스크톱 */
  size?: "sm" | "md";
};

/**
 * Figma `kebab-menu` (`1:3669`) — 상품 수정 / 상품 삭제
 * 상세(내가 등록한 상품) 시안과 동일 패턴을 등록 내역에도 사용합니다.
 */
export function ProductMineMenu({
  productName,
  onEdit,
  onDelete,
  size = "md",
}: ProductMineMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMd = size === "md";

  useOutsideDismiss(containerRef, {
    enabled: open,
    onDismiss: () => setOpen(false),
  });

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-label={`${productName} 메뉴`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((previous) => !previous)}
        className={
          isMd
            ? "flex size-9 cursor-pointer items-center justify-center text-snack-gray-400"
            : "flex size-6 cursor-pointer items-center justify-center text-snack-gray-400"
        }
      >
        <Icon name="kebab-menu" size={isMd ? "md" : "sm"} />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={`${productName} 작업`}
          className={
            isMd
              ? "absolute top-10 right-0 z-20 flex w-[119px] flex-col overflow-hidden rounded-2xl bg-surface shadow-[4px_4px_4px_rgba(236,236,236,0.25)]"
              : "absolute top-8 right-0 z-20 flex w-[88px] flex-col overflow-hidden rounded-2xl bg-surface shadow-[4px_4px_4px_rgba(236,236,236,0.25)]"
          }
        >
          <button
            type="button"
            role="menuitem"
            className={
              isMd
                ? "flex w-full cursor-pointer items-center justify-center bg-transparent px-[26px] py-3.5 text-lg leading-[26px] font-normal text-snack-black-200"
                : "flex w-full cursor-pointer items-center justify-center bg-transparent px-[18px] py-2.5 text-sm leading-6 font-normal text-snack-black-200"
            }
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            상품 수정
          </button>
          <button
            type="button"
            role="menuitem"
            className={
              isMd
                ? "flex w-full cursor-pointer items-center justify-center bg-transparent px-[26px] py-3.5 text-lg leading-[26px] font-normal text-snack-black-200"
                : "flex w-full cursor-pointer items-center justify-center bg-transparent px-[18px] py-2.5 text-sm leading-6 font-normal text-snack-black-200"
            }
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            상품 삭제
          </button>
        </div>
      ) : null}
    </div>
  );
}
