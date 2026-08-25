"use client";

import { isAxiosError } from "axios";

import { CommonImage, Modal, showToast } from "@/components/ui";
import { useRestoreUser } from "@/hooks/mutations/useRestoreUser";

export type RestoreMemberTarget = {
  id: string;
  name: string;
  email: string;
};

export type RestoreMemberModalProps = {
  open: boolean;
  member: RestoreMemberTarget | null;
  onClose: () => void;
  onConfirm?: (member: RestoreMemberTarget) => void;
};

/**
 * 계정 복구 확인 모달.
 * 탈퇴 확인 모달과 같은 일러스트 확인형입니다.
 */
export function RestoreMemberModal({
  open,
  member,
  onClose,
  onConfirm,
}: RestoreMemberModalProps) {
  const restoreMutation = useRestoreUser();

  const handleClose = () => {
    if (restoreMutation.isPending) {
      return;
    }
    onClose();
  };

  const handleConfirm = () => {
    if (!member || restoreMutation.isPending) {
      return;
    }

    restoreMutation.mutate(member.id, {
      onSuccess: () => {
        onConfirm?.(member);
        showToast("계정이 복구되었습니다.");
        onClose();
      },
      onError: (error) => {
        const message = isAxiosError(error)
          ? ((error.response?.data as { message?: string } | undefined)
              ?.message ?? error.message)
          : error instanceof Error
            ? error.message
            : "계정 복구에 실패했습니다.";
        showToast(message);
      },
    });
  };

  return (
    <Modal
      open={open && Boolean(member)}
      onClose={handleClose}
      closeOnOverlayClick={!restoreMutation.isPending}
      title="계정 복구"
      description={
        <p>
          <span className="text-snack-black-100">
            {member?.name}({member?.email})
          </span>
          님의 계정을 복구할까요?
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
        label: restoreMutation.isPending ? "복구 중…" : "복구하기",
        variant: "primary",
        onClick: handleConfirm,
      }}
    />
  );
}
