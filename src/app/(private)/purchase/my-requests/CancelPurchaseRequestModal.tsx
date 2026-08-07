"use client";

import { CommonImage, Modal, showToast } from "@/components/ui";

export type CancelPurchaseRequestTarget = {
  id: string;
  productName: string;
};

export type CancelPurchaseRequestModalProps = {
  open: boolean;
  request: CancelPurchaseRequestTarget | null;
  onClose: () => void;
  onConfirm?: (request: CancelPurchaseRequestTarget) => void;
};

/**
 * 구매 요청 취소 확인 모달.
 * 일러스트 확인형이라 공통 `Modal`을 사용합니다.
 */
export function CancelPurchaseRequestModal({
  open,
  request,
  onClose,
  onConfirm,
}: CancelPurchaseRequestModalProps) {
  const handleConfirm = () => {
    if (!request) {
      return;
    }

    // TODO: 구매 요청 취소 API 연동
    onConfirm?.(request);
    showToast("구매 요청을 취소했어요.");
    onClose();
  };

  return (
    <Modal
      open={open && Boolean(request)}
      onClose={onClose}
      title="구매 요청 취소"
      description={
        <>
          <p>
            <span className="text-snack-black-100">{request?.productName}</span>
            {" 구매 요청을 취소하시겠어요?"}
          </p>
          <p>구매 요청 취소 후에는 복구할 수 없어요!</p>
        </>
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
        label: "취소할래요",
        variant: "primary",
        onClick: handleConfirm,
      }}
    />
  );
}
