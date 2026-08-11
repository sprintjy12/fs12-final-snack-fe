"use client";

import { isAxiosError } from "axios";

import { CommonImage, Modal, showToast } from "@/components/ui";
import { useWithdrawUser } from "@/hooks/mutations/useWithdrawUser";

export type WithdrawMemberTarget = {
  id: string;
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
  const withdrawMutation = useWithdrawUser();

  const handleClose = () => {
    if (withdrawMutation.isPending) {
      return;
    }
    onClose();
  };

  const handleConfirm = () => {
    if (!member || withdrawMutation.isPending) {
      return;
    }

    withdrawMutation.mutate(member.id, {
      onSuccess: () => {
        onConfirm?.(member);
        showToast("계정이 탈퇴되었습니다.");
        onClose();
      },
      onError: (error) => {
        const message = isAxiosError(error)
          ? ((error.response?.data as { message?: string } | undefined)
              ?.message ?? error.message)
          : error instanceof Error
            ? error.message
            : "계정 탈퇴에 실패했습니다.";
        showToast(message);
      },
    });
  };

  return (
    <Modal
      open={open && Boolean(member)}
      onClose={handleClose}
      closeOnOverlayClick={!withdrawMutation.isPending}
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
        onClick: handleClose,
      }}
      primaryAction={{
        label: withdrawMutation.isPending ? "탈퇴 중…" : "탈퇴시키기",
        variant: "primary",
        onClick: handleConfirm,
      }}
    />
  );
}
