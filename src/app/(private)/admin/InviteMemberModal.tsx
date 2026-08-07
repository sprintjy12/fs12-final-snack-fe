"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { z } from "zod";

import {
  Button,
  ModalShell,
  Select,
  TextField,
  showToast,
} from "@/components/ui";

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
  const { fieldErrors } = z.flattenError(error);
  const nameMessage = fieldErrors.name?.[0];
  const emailMessage = fieldErrors.email?.[0];

  const isNameMissing = error.issues.some(
    (issue) => issue.path[0] === "name" && issue.code === "too_small",
  );
  const isEmailMissing = error.issues.some(
    (issue) => issue.path[0] === "email" && issue.code === "too_small",
  );

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
  const roleLabelId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteMemberRole>("admin");

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setRole("admin");
    }
  }, [open]);

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
            <TextField
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="이름을 입력해주세요"
              autoComplete="name"
            />
          </label>

          <label className="flex w-full flex-col gap-4">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
              이메일
            </span>
            <TextField
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일을 입력해주세요"
              autoComplete="email"
            />
          </label>

          <div className="flex w-full flex-col gap-4">
            <span
              id={roleLabelId}
              className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8"
            >
              권한
            </span>
            <Select
              options={ROLE_OPTIONS}
              value={role}
              onChange={setRole}
              labelId={roleLabelId}
              flipChevron={false}
            />
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3 xl:gap-5">
          <Button
            type="button"
            variant="secondary"
            width="modal"
            className="flex-1"
            onClick={onClose}
          >
            취소
          </Button>
          <Button type="submit" width="modal" className="flex-1">
            {/* Mobile/Tablet: 초대하기 / Desktop: 등록하기 */}
            <span className="xl:hidden">초대하기</span>
            <span className="hidden xl:inline">등록하기</span>
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
