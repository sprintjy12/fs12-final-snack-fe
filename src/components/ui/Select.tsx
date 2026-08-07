"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { useOutsideDismiss } from "@/hooks/useOutsideDismiss";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

export type SelectProps<T extends string = string> = {
  options: readonly SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 접근성용 라벨 요소 id */
  labelId?: string;
  /** 열렸을 때 chevron-up 표시 (기본 true) */
  flipChevron?: boolean;
  className?: string;
  "aria-label"?: string;
};

/**
 * 커스텀 셀렉트(콤보박스).
 * 회원 초대·권한 변경 모달의 드롭다운 패턴을 공통화했습니다.
 */
export function Select<T extends string = string>({
  options,
  value,
  onChange,
  labelId,
  flipChevron = true,
  className,
  "aria-label": ariaLabel,
}: SelectProps<T>) {
  const listId = useId();
  const valueId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const highlightedIndexRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? options[0]?.label;

  useEffect(() => {
    if (!open) {
      return;
    }

    const selectedIndex = Math.max(
      0,
      options.findIndex((option) => option.value === value),
    );
    setHighlightedIndex(selectedIndex);
    highlightedIndexRef.current = selectedIndex;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !menuRef.current?.contains(target)) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((currentIndex) => {
          const nextIndex = (currentIndex + 1) % options.length;
          highlightedIndexRef.current = nextIndex;
          return nextIndex;
        });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex((currentIndex) => {
          const nextIndex =
            (currentIndex - 1 + options.length) % options.length;
          highlightedIndexRef.current = nextIndex;
          return nextIndex;
        });
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const selectedOption = options[highlightedIndexRef.current];
        if (!selectedOption) {
          return;
        }
        onChange(selectedOption.value);
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open, options, value, onChange]);

  useOutsideDismiss(menuRef, {
    enabled: open,
    onDismiss: () => setOpen(false),
    stopEscapePropagation: true,
  });

  const chevronName =
    flipChevron && open ? ("chevron-up" as const) : ("chevron-down" as const);

  return (
    <div ref={menuRef} className={["relative w-full", className].filter(Boolean).join(" ")}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="none"
        aria-label={ariaLabel}
        aria-labelledby={
          labelId ? `${labelId} ${valueId}` : valueId
        }
        aria-activedescendant={
          open ? `${listId}-option-${highlightedIndex}` : undefined
        }
        onClick={() => setOpen((previous) => !previous)}
        className="flex h-[54px] w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-snack-orange-300 bg-surface px-3.5 text-left text-foreground xl:h-16"
      >
        <span
          id={valueId}
          className="min-w-0 flex-1 truncate text-sm leading-6 xl:text-xl xl:leading-8"
        >
          {selectedLabel}
        </span>
        <span
          aria-hidden
          className="flex size-6 shrink-0 items-center justify-center text-accent xl:size-9"
        >
          <span className="flex size-full items-center justify-center xl:hidden">
            <Icon name={chevronName} size="sm" className="block" />
          </span>
          <span className="hidden size-full items-center justify-center xl:flex">
            <Icon name={chevronName} size="md" className="block" />
          </span>
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          className="absolute top-[calc(100%+8px)] right-0 left-0 z-10 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
        >
          {options.map((option, index) => (
            <li key={option.value} role="presentation">
              <div
                id={`${listId}-option-${index}`}
                role="option"
                tabIndex={-1}
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={[
                  "flex h-11 w-full cursor-pointer items-center px-4 text-sm leading-6 xl:h-14 xl:text-xl xl:leading-8",
                  value === option.value || highlightedIndex === index
                    ? "bg-snack-background-500 font-semibold text-accent"
                    : "bg-transparent font-medium text-foreground",
                ].join(" ")}
              >
                {option.label}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
