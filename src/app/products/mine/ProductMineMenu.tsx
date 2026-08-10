"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { Icon } from "@/components/ui";
import { useOutsideDismiss } from "@/hooks/useOutsideDismiss";

type ProductMineMenuProps = {
  productName: string;
  onEdit: () => void;
  onDelete: () => void;
  /** Figma kebab-menu: sm=모바일, md=데스크톱 */
  size?: "sm" | "md";
};

const MENU_ITEM_COUNT = 2;

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isMd = size === "md";

  const closeMenu = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  useOutsideDismiss(containerRef, {
    enabled: open,
    onDismiss: () => closeMenu(true),
  });

  useEffect(() => {
    if (!open) return;
    itemRefs.current[0]?.focus();
  }, [open]);

  const focusItem = (index: number) => {
    const next = ((index % MENU_ITEM_COUNT) + MENU_ITEM_COUNT) % MENU_ITEM_COUNT;
    itemRefs.current[next]?.focus();
  };

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const currentIndex = itemRefs.current.findIndex(
      (item) => item === document.activeElement,
    );

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusItem(currentIndex < 0 ? 0 : currentIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusItem(currentIndex < 0 ? MENU_ITEM_COUNT - 1 : currentIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusItem(0);
        break;
      case "End":
        event.preventDefault();
        focusItem(MENU_ITEM_COUNT - 1);
        break;
      case "Tab":
        closeMenu(false);
        break;
      default:
        break;
    }
  };

  const handleTriggerKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (!open && event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const triggerClassName = isMd
    ? "flex size-9 cursor-pointer items-center justify-center text-snack-gray-400"
    : "flex size-6 cursor-pointer items-center justify-center text-snack-gray-400";

  const menuClassName = isMd
    ? "absolute top-10 right-0 z-20 flex w-[119px] flex-col overflow-hidden rounded-2xl bg-surface shadow-[4px_4px_4px_rgba(236,236,236,0.25)]"
    : "absolute top-8 right-0 z-20 flex w-[88px] flex-col overflow-hidden rounded-2xl bg-surface shadow-[4px_4px_4px_rgba(236,236,236,0.25)]";

  const itemClassName = isMd
    ? "flex w-full cursor-pointer items-center justify-center bg-transparent px-[26px] py-3.5 text-lg leading-[26px] font-normal text-snack-black-200 focus-visible:bg-snack-background-300 focus-visible:outline-none"
    : "flex w-full cursor-pointer items-center justify-center bg-transparent px-[18px] py-2.5 text-sm leading-6 font-normal text-snack-black-200 focus-visible:bg-snack-background-300 focus-visible:outline-none";

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${productName} 메뉴`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((previous) => !previous)}
        onKeyDown={handleTriggerKeyDown}
        className={triggerClassName}
      >
        <Icon name="kebab-menu" size={isMd ? "md" : "sm"} />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={`${productName} 작업`}
          className={menuClassName}
          onKeyDown={handleMenuKeyDown}
        >
          <button
            ref={(node) => {
              itemRefs.current[0] = node;
            }}
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={itemClassName}
            onClick={() => {
              closeMenu(true);
              onEdit();
            }}
          >
            상품 수정
          </button>
          <button
            ref={(node) => {
              itemRefs.current[1] = node;
            }}
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={itemClassName}
            onClick={() => {
              closeMenu(true);
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
