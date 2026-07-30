"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { z } from "zod";

import { Icon, ModalShell, showToast } from "@/components/ui";

export type InviteMemberRole = "admin" | "member";

export type InviteMemberModalProps = {
  open: boolean;
  onClose: () => void;
  /** 등록/초대 성공 시 호출. API 연동 전 샘플용 */
  onSubmit?: (values: {
    name: string;
    email: string;
    role: InviteMemberRole;
  }) => void;
};

const ROLE_OPTIONS = [
  { value: "admin" as const, label: "관리자" },
  { value: "member" as const, label: "일반" },
];

const inviteMemberSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요."),
  email: z
    .string()
    .trim()
    .min(1, "이메일을 입력해 주세요.")
    .email("올바른 이메일을 입력해 주세요."),
  role: z.enum(["admin", "member"]),
});

function getInviteToastMessage(
  error: z.ZodError<z.infer<typeof inviteMemberSchema>>,
) {
  const fieldErrors = error.flatten().fieldErrors;
  const nameMessage = fieldErrors.name?.[0];
  const emailMessage = fieldErrors.email?.[0];

  const isNameMissing = nameMessage?.includes("입력해 주세요");
  const isEmailMissing = emailMessage?.includes("입력해 주세요");

  if (isNameMissing && isEmailMissing) {
    return "이름, 이메일을 입력해 주세요.";
  }

  return [nameMessage, emailMessage].filter(Boolean).join(" ");
}

/**
 * 회원 초대 폼 모달.
 * ModalShell 위에 시안 폼을 올린 도메인 모달입니다. (확인용 Modal과 분리)
 */
export function InviteMemberModal({
  open,
  onClose,
  onSubmit,
}: InviteMemberModalProps) {
  const titleId = useId();
  const roleListId = useId();
  const roleMenuRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteMemberRole>("admin");
  const [roleOpen, setRoleOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setRole("admin");
      setRoleOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!roleOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && !roleMenuRef.current?.contains(target)) {
        setRoleOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [roleOpen]);

  const selectedRoleLabel =
    ROLE_OPTIONS.find((option) => option.value === role)?.label ?? "관리자";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = inviteMemberSchema.safeParse({ name, email, role });

    if (!result.success) {
      showToast(getInviteToastMessage(result.error));
      return;
    }

    // TODO: 회원 초대 API 연동
    onSubmit?.(result.data);
    showToast("회원 초대를 완료했어요.");
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      className="flex max-w-[375px] flex-col gap-6 p-6 md:max-w-[375px] md:rounded-[32px] xl:max-w-[688px] xl:gap-8 xl:px-6 xl:pt-8 xl:pb-10"
    >
      <h2
        id={titleId}
        className="w-full text-xl leading-8 font-bold text-foreground-strong xl:text-2xl"
      >
        회원 초대
      </h2>

      <div className="h-px w-full shrink-0 bg-border" />

      <form
        noValidate
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-6 xl:gap-8"
      >
        <div className="flex w-full flex-col gap-4 xl:gap-8">
          <label className="flex w-full flex-col gap-4">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              이름
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="이름을 입력해주세요"
              autoComplete="name"
              className="h-[54px] w-full rounded-2xl border border-snack-orange-300 bg-surface px-3.5 text-sm leading-6 text-foreground outline-none placeholder:text-snack-gray-400 xl:h-16 xl:text-xl xl:leading-8"
            />
          </label>

          <label className="flex w-full flex-col gap-4">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              이메일
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일을 입력해주세요"
              autoComplete="email"
              className="h-[54px] w-full rounded-2xl border border-snack-orange-300 bg-surface px-3.5 text-sm leading-6 text-foreground outline-none placeholder:text-snack-gray-400 xl:h-16 xl:text-xl xl:leading-8"
            />
          </label>

          <div className="flex w-full flex-col gap-4">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              권한
            </span>
            <div ref={roleMenuRef} className="relative w-full">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={roleOpen}
                aria-controls={roleListId}
                onClick={() => setRoleOpen((previous) => !previous)}
                className="flex h-[54px] w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-snack-orange-300 bg-surface px-3.5 text-left text-foreground xl:h-16"
              >
                <span className="min-w-0 flex-1 truncate text-sm leading-6 xl:text-xl xl:leading-8">
                  {selectedRoleLabel}
                </span>
                {/* Icon의 inline-block/baseline 정렬을 flex 박스로 보정 */}
                <span
                  aria-hidden
                  className="flex size-6 shrink-0 items-center justify-center text-accent xl:size-9"
                >
                  <span className="flex size-full items-center justify-center xl:hidden">
                    <Icon name="chevron-down" size="sm" className="block" />
                  </span>
                  <span className="hidden size-full items-center justify-center xl:flex">
                    <Icon name="chevron-down" size="md" className="block" />
                  </span>
                </span>
              </button>

              {roleOpen ? (
                <ul
                  id={roleListId}
                  role="listbox"
                  aria-label="권한 선택"
                  className="absolute top-[calc(100%+8px)] right-0 left-0 z-10 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={role === option.value}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setRole(option.value);
                          setRoleOpen(false);
                        }}
                        className={[
                          "flex h-11 w-full cursor-pointer items-center px-4 text-sm leading-6 xl:h-14 xl:text-xl xl:leading-8",
                          role === option.value
                            ? "bg-snack-background-500 font-semibold text-accent"
                            : "bg-transparent font-medium text-foreground",
                        ].join(" ")}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3 xl:gap-5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[54px] flex-1 cursor-pointer items-center justify-center rounded-2xl bg-snack-background-500 p-4 text-base leading-[26px] font-semibold text-accent xl:h-16 xl:max-w-[310px] xl:flex-none xl:w-[310px] xl:text-xl xl:leading-8"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex h-[54px] flex-1 cursor-pointer items-center justify-center rounded-2xl bg-accent p-4 text-base leading-[26px] font-semibold text-surface xl:h-16 xl:max-w-[310px] xl:flex-none xl:w-[310px] xl:text-xl xl:leading-8"
          >
            {/* Mobile/Tablet: 초대하기 / Desktop: 등록하기 */}
            <span className="xl:hidden">초대하기</span>
            <span className="hidden xl:inline">등록하기</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
