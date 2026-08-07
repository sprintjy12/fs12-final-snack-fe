"use client";

import { useState, type ReactNode } from "react";

import { InviteMemberModal } from "@/app/(private)/admin/InviteMemberModal";

type AdminInviteButtonProps = {
  className?: string;
  children: ReactNode;
};

/** 회원 초대 버튼 + 모달 트리거 */
export function AdminInviteButton({
  className,
  children,
}: AdminInviteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>
      <InviteMemberModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
