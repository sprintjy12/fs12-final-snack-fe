"use client";

import Image from "next/image";
import { useState } from "react";

import {
  ChangeMemberRoleModal,
  type ChangeMemberRoleTarget,
  type MemberRole,
} from "@/app/(private)/admin/ChangeMemberRoleModal";
import { MemberMenu } from "@/app/(private)/admin/MemberMenu";
import {
  WithdrawMemberModal,
  type WithdrawMemberTarget,
} from "@/app/(private)/admin/WithdrawMemberModal";
import { Pagination } from "@/components/ui";

export type AdminMember = {
  id: number;
  name: string;
  email: string;
  role: MemberRole;
};

type AdminMemberListProps = {
  members: AdminMember[];
};

const paginationItems = ["1", "2", "3", "more", "9"] as const;

function RoleChip({ role, size }: { role: MemberRole; size: "sm" | "md" }) {
  const isAdmin = role === "admin";

  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full px-2 py-0.5 font-medium",
        isAdmin
          ? "bg-snack-background-500 text-accent"
          : "bg-snack-background-300 text-snack-gray-500",
        size === "md" ? "text-xl leading-8" : "text-xs leading-[18px]",
      ].join(" ")}
    >
      {isAdmin ? "관리자" : "일반"}
    </span>
  );
}

function MemberAvatar({
  role,
  size,
}: {
  role: MemberRole;
  size: "sm" | "md";
}) {
  const dimension = size === "md" ? 48 : 40;

  return (
    <Image
      src={
        role === "admin"
          ? "/images/common/avatar-admin.svg"
          : "/images/common/avatar-member.svg"
      }
      alt=""
      width={dimension}
      height={dimension}
      className={size === "md" ? "size-12" : "size-10"}
    />
  );
}

export function AdminMemberList({ members }: AdminMemberListProps) {
  const [roleTarget, setRoleTarget] = useState<ChangeMemberRoleTarget | null>(
    null,
  );
  const [withdrawTarget, setWithdrawTarget] =
    useState<WithdrawMemberTarget | null>(null);

  const openRoleModal = (member: AdminMember) => {
    setRoleTarget(member);
  };

  const closeRoleModal = () => {
    setRoleTarget(null);
  };

  const openWithdrawModal = (member: AdminMember) => {
    setWithdrawTarget(member);
  };

  const closeWithdrawModal = () => {
    setWithdrawTarget(null);
  };

  return (
    <>
      <ul className="mt-2 xl:mt-4" aria-label="회원 목록">
        {members.map((member, index) => (
          <li
            key={member.id}
            className={[
              "relative border-b border-border",
              // Tablet 시안 8명 / Mobile·Desktop 시안 6명
              // TODO: API 연동 시 페이지네이션으로 전체 접근 가능하게 처리
              index >= 6 ? "hidden md:list-item xl:hidden" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Mobile / Tablet 카드 */}
            <div className="flex items-center gap-3 py-5 xl:hidden">
              <MemberAvatar role={member.role} size="sm" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-6 text-snack-gray-500">
                    {member.name}
                  </span>
                  <RoleChip role={member.role} size="sm" />
                </div>
                <span className="text-xs leading-[18px] text-snack-gray-500">
                  {member.email}
                </span>
              </div>
              <MemberMenu
                memberName={member.name}
                onChangeRole={() => openRoleModal(member)}
                onWithdraw={() => openWithdrawModal(member)}
              />
            </div>

            {/* Desktop 행 */}
            <div className="hidden items-center justify-center px-20 py-3 xl:flex">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-10">
                  <div className="flex h-20 w-[250px] items-center justify-center gap-3.5">
                    <MemberAvatar role={member.role} size="md" />
                    <span className="text-xl leading-8 text-snack-black-100">
                      {member.name}
                    </span>
                  </div>
                  <div className="flex h-20 w-[300px] items-center justify-center">
                    <span className="text-xl leading-8 text-snack-black-100">
                      {member.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-[250px] items-center justify-center">
                    <RoleChip role={member.role} size="md" />
                  </div>
                  <div className="flex h-20 w-[250px] items-center justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openWithdrawModal(member)}
                        className="cursor-pointer rounded-lg bg-snack-background-300 px-4 py-2 text-lg leading-[26px] font-medium text-snack-gray-500"
                      >
                        계정 탈퇴
                      </button>
                      <button
                        type="button"
                        onClick={() => openRoleModal(member)}
                        className="cursor-pointer rounded-lg border border-accent bg-accent px-4 py-2 text-lg leading-[26px] font-semibold text-surface"
                      >
                        권한 변경
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Pagination
        aria-label="회원 목록 페이지"
        items={paginationItems}
        previousDisabled
        className="mt-4 py-2 md:mt-8 xl:mt-10"
      />

      <ChangeMemberRoleModal
        open={Boolean(roleTarget)}
        member={roleTarget}
        onClose={closeRoleModal}
      />

      <WithdrawMemberModal
        open={Boolean(withdrawTarget)}
        member={withdrawTarget}
        onClose={closeWithdrawModal}
      />
    </>
  );
}
