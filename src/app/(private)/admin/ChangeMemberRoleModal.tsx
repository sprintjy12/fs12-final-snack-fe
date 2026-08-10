"use client";

import { isAxiosError } from "axios";
import { useEffect, useId, useState, type FormEvent } from "react";

import {
  Button,
  ModalShell,
  Select,
  TextField,
  showToast,
} from "@/components/ui";
import { useUpdateUserRole } from "@/hooks/mutations/useUpdateUserRole";
import type { UpdateUserRoleApiRole } from "@/types/userTypes";

export type MemberRole = "admin" | "member";

export type ChangeMemberRoleTarget = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
};

export type ChangeMemberRoleModalProps = {
  open: boolean;
  member: ChangeMemberRoleTarget | null;
  onClose: () => void;
  onSubmit?: (values: { id: string; role: MemberRole }) => void;
};

const ROLE_OPTIONS = [
  { value: "admin" as const, label: "관리자" },
  { value: "member" as const, label: "일반" },
];

const ROLE_TO_API: Record<MemberRole, UpdateUserRoleApiRole> = {
  admin: "ADMIN",
  member: "USER",
};

/**
 * 회원 권한 변경 폼 모달.
 * 이름/이메일은 읽기 전용, 권한만 변경합니다. (ModalShell 사용)
 * API: PATCH /api/users/:userId/role
 */
export function ChangeMemberRoleModal({
  open,
  member,
  onClose,
  onSubmit,
}: ChangeMemberRoleModalProps) {
  const titleId = useId();
  const roleLabelId = useId();
  const updateRoleMutation = useUpdateUserRole();

  const [role, setRole] = useState<MemberRole>("admin");

  useEffect(() => {
    if (!open || !member) {
      return;
    }

    setRole(member.role);
  }, [open, member]);

  const handleClose = () => {
    if (updateRoleMutation.isPending) {
      return;
    }
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!member || updateRoleMutation.isPending) {
      return;
    }

    updateRoleMutation.mutate(
      {
        userId: member.id,
        payload: { role: ROLE_TO_API[role] },
      },
      {
        onSuccess: () => {
          onSubmit?.({ id: member.id, role });
          showToast("권한이 변경되었습니다.");
          onClose();
        },
        onError: (error) => {
          const message = isAxiosError(error)
            ? ((error.response?.data as { message?: string } | undefined)
                ?.message ?? error.message)
            : error instanceof Error
              ? error.message
              : "권한 변경에 실패했습니다.";
          showToast(message);
        },
      },
    );
  };

  return (
    <ModalShell
      open={open && Boolean(member)}
      onClose={handleClose}
      closeOnOverlayClick={!updateRoleMutation.isPending}
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
              <dd>
                <TextField readOnlyBox>{member?.name}</TextField>
              </dd>
            </div>

            <div className="flex w-full flex-col gap-4">
              <dt className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                이메일
              </dt>
              <dd>
                <TextField readOnlyBox>{member?.email}</TextField>
              </dd>
            </div>
          </dl>

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
            />
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center justify-between gap-3 xl:gap-5"
      >
        <Button
          type="button"
          variant="secondary"
          width="modal"
          className="flex-1"
          disabled={updateRoleMutation.isPending}
          onClick={handleClose}
        >
          취소
        </Button>
        <Button
          type="submit"
          width="modal"
          className="flex-1"
          disabled={updateRoleMutation.isPending}
        >
          {updateRoleMutation.isPending ? "변경 중…" : "변경하기"}
        </Button>
      </form>
    </ModalShell>
  );
}
