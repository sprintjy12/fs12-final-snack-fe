"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Icon, ModalShell, showToast } from "@/components/ui";
import { useOutsideDismiss } from "@/hooks/useOutsideDismiss";

export type MemberRole = "admin" | "member";

export type ChangeMemberRoleTarget = {
  id: number;
  name: string;
  email: string;
  role: MemberRole;
};

export type ChangeMemberRoleModalProps = {
  open: boolean;
  member: ChangeMemberRoleTarget | null;
  onClose: () => void;
  onSubmit?: (values: { id: number; role: MemberRole }) => void;
};

const ROLE_OPTIONS = [
  { value: "admin" as const, label: "관리자" },
  { value: "member" as const, label: "일반" },
];

/**
 * 회원 권한 변경 폼 모달.
 * 이름/이메일은 읽기 전용, 권한만 변경합니다. (ModalShell 사용)
 */
export function ChangeMemberRoleModal({
  open,
  member,
  onClose,
  onSubmit,
}: ChangeMemberRoleModalProps) {
  const titleId = useId();
  const roleListId = useId();
  const roleLabelId = useId();
  const roleValueId = useId();
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const highlightedRoleIndexRef = useRef(0);

  const [role, setRole] = useState<MemberRole>("admin");
  const [roleOpen, setRoleOpen] = useState(false);
  const [highlightedRoleIndex, setHighlightedRoleIndex] = useState(0);

  useEffect(() => {
    if (!open || !member) {
      setRoleOpen(false);
      setHighlightedRoleIndex(0);
      highlightedRoleIndexRef.current = 0;
      return;
    }

    setRole(member.role);
    setRoleOpen(false);
    setHighlightedRoleIndex(0);
    highlightedRoleIndexRef.current = 0;
  }, [open, member]);

  useEffect(() => {
    if (!roleOpen) {
      return;
    }

    const selectedIndex = Math.max(
      0,
      ROLE_OPTIONS.findIndex((option) => option.value === role),
    );
    setHighlightedRoleIndex(selectedIndex);
    highlightedRoleIndexRef.current = selectedIndex;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 드롭다운 밖(입력칸·제출 버튼 등)으로 Tab 이동 시 Enter/Space를 가로채지 않습니다.
      const target = event.target;
      if (
        !(target instanceof Node) ||
        !roleMenuRef.current?.contains(target)
      ) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedRoleIndex((currentIndex) => {
          const nextIndex = (currentIndex + 1) % ROLE_OPTIONS.length;
          highlightedRoleIndexRef.current = nextIndex;
          return nextIndex;
        });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedRoleIndex((currentIndex) => {
          const nextIndex =
            (currentIndex - 1 + ROLE_OPTIONS.length) % ROLE_OPTIONS.length;
          highlightedRoleIndexRef.current = nextIndex;
          return nextIndex;
        });
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const selectedOption = ROLE_OPTIONS[highlightedRoleIndexRef.current];
        if (!selectedOption) {
          return;
        }
        setRole(selectedOption.value);
        setRoleOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [roleOpen, role]);

  useOutsideDismiss(roleMenuRef, {
    enabled: roleOpen,
    onDismiss: () => setRoleOpen(false),
    stopEscapePropagation: true,
  });

  const selectedRoleLabel =
    ROLE_OPTIONS.find((option) => option.value === role)?.label ?? "관리자";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!member) {
      return;
    }

    // TODO: 권한 변경 API 연동
    onSubmit?.({ id: member.id, role });
    showToast("권한이 변경되었습니다.");
    onClose();
  };

  const readOnlyFieldClassName =
    "flex h-[54px] w-full items-center rounded-2xl border border-snack-orange-300 bg-surface-muted px-3.5 text-sm leading-6 text-foreground xl:h-16 xl:text-xl xl:leading-8";

  return (
    <ModalShell
      open={open && Boolean(member)}
      onClose={onClose}
      aria-labelledby={titleId}
      className="flex max-w-[375px] flex-col gap-10 p-6 md:max-w-[375px] md:rounded-[32px] xl:max-w-[688px] xl:gap-14 xl:px-6 xl:pt-8 xl:pb-10"
    >
      <div className="flex w-full flex-col gap-4 xl:gap-6">
        <h2
          id={titleId}
          className="w-full text-xl leading-8 font-bold text-foreground-strong xl:text-2xl"
        >
          회원 권한 변경
        </h2>

        <div className="h-px w-full shrink-0 bg-border" />

        <div className="flex w-full flex-col gap-4 xl:gap-8">
          <dl className="contents">
            <div className="flex w-full flex-col gap-4">
              <dt className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                이름
              </dt>
              <dd className={readOnlyFieldClassName}>{member?.name}</dd>
            </div>

            <div className="flex w-full flex-col gap-4">
              <dt className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                이메일
              </dt>
              <dd className={readOnlyFieldClassName}>{member?.email}</dd>
            </div>
          </dl>

          <div className="flex w-full flex-col gap-4">
            <span
              id={roleLabelId}
              className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8"
            >
              권한
            </span>
            <div ref={roleMenuRef} className="relative w-full">
              <button
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={roleOpen}
                aria-controls={roleListId}
                aria-autocomplete="none"
                aria-labelledby={`${roleLabelId} ${roleValueId}`}
                aria-activedescendant={
                  roleOpen
                    ? `${roleListId}-option-${highlightedRoleIndex}`
                    : undefined
                }
                onClick={() => setRoleOpen((previous) => !previous)}
                className="flex h-[54px] w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-snack-orange-300 bg-surface px-3.5 text-left text-foreground xl:h-16"
              >
                <span
                  id={roleValueId}
                  className="min-w-0 flex-1 truncate text-sm leading-6 xl:text-xl xl:leading-8"
                >
                  {selectedRoleLabel}
                </span>
                <span
                  aria-hidden
                  className="flex size-6 shrink-0 items-center justify-center text-accent xl:size-9"
                >
                  <span className="flex size-full items-center justify-center xl:hidden">
                    <Icon
                      name={roleOpen ? "chevron-up" : "chevron-down"}
                      size="sm"
                      className="block"
                    />
                  </span>
                  <span className="hidden size-full items-center justify-center xl:flex">
                    <Icon
                      name={roleOpen ? "chevron-up" : "chevron-down"}
                      size="md"
                      className="block"
                    />
                  </span>
                </span>
              </button>

              {roleOpen ? (
                <ul
                  id={roleListId}
                  role="listbox"
                  aria-labelledby={roleLabelId}
                  className="absolute top-[calc(100%+8px)] right-0 left-0 z-10 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                >
                  {ROLE_OPTIONS.map((option, index) => (
                    <li key={option.value} role="presentation">
                      <div
                        id={`${roleListId}-option-${index}`}
                        role="option"
                        tabIndex={-1}
                        aria-selected={role === option.value}
                        onClick={() => {
                          setRole(option.value);
                          setRoleOpen(false);
                        }}
                        className={[
                          "flex h-11 w-full cursor-pointer items-center px-4 text-sm leading-6 xl:h-14 xl:text-xl xl:leading-8",
                          role === option.value || highlightedRoleIndex === index
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
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center justify-between gap-3 xl:gap-5"
      >
        <button
          type="button"
          onClick={onClose}
          className="flex h-[54px] flex-1 cursor-pointer items-center justify-center rounded-2xl bg-snack-background-500 p-4 text-base leading-[26px] font-semibold text-accent xl:h-16 xl:w-[310px] xl:max-w-[310px] xl:flex-none xl:text-xl xl:leading-8"
        >
          취소
        </button>
        <button
          type="submit"
          className="flex h-[54px] flex-1 cursor-pointer items-center justify-center rounded-2xl bg-accent p-4 text-base leading-[26px] font-semibold text-surface xl:h-16 xl:w-[310px] xl:max-w-[310px] xl:flex-none xl:text-xl xl:leading-8"
        >
          변경하기
        </button>
      </form>
    </ModalShell>
  );
}
