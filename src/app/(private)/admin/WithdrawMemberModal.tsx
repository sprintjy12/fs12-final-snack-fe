"use client";

import {
  CommonImage,
  Modal,
  showToast,
} from "@/components/ui";

export type WithdrawMemberTarget = {
  id: number;
  name: string;
  email: string;
};

export type WithdrawMemberModalProps = {
  open: boolean;
  member: WithdrawMemberTarget | null;
  onClose: () => void;
  onConfirm?: (member: WithdrawMemberTarget) => void;
};

/**
 * 계정 탈퇴 확인 모달.
 * 일러스트 확인형이라 공통 `Modal`을 그대로 사용합니다.
 */
export function WithdrawMemberModal({
  open,
  member,
  onClose,
  onConfirm,
}: WithdrawMemberModalProps) {
  const handleConfirm = () => {
    if (!member) {
      return;
    }

    // TODO: 계정 탈퇴 API 연동
    onConfirm?.(member);
    showToast("계정이 탈퇴되었습니다.");
    onClose();
  };

  return (
    <Modal
      open={open && Boolean(member)}
      onClose={onClose}
      title="계정 탈퇴"
      description={
        <p>
          <span className="text-snack-black-100">
            {member?.name}({member?.email})
          </span>
          님의 계정을 탈퇴시킬까요?
        </p>
      }
      illustration={
        <CommonImage
          name="modal-warning"
          size="md"
          className="h-full w-full"
        />
      }
      secondaryAction={{
        label: "더 생각해볼게요",
        variant: "secondary",
        onClick: onClose,
      }}
      primaryAction={{
        label: "탈퇴시키기",
        variant: "primary",
        onClick: handleConfirm,
      }}
    />
  );
}
