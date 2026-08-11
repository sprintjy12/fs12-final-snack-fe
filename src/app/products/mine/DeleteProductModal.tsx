"use client";

import { CommonImage, Modal, showToast } from "@/components/ui";

export type DeleteProductTarget = {
  id: string;
  name: string;
};

export type DeleteProductModalProps = {
  open: boolean;
  product: DeleteProductTarget | null;
  onClose: () => void;
  onConfirm?: (product: DeleteProductTarget) => void;
};

/**
 * Figma `Modal_상품 삭제` / 상품상세_상품 삭제 모달
 * — 「{이름} 상품을 삭제할까요? / 상품 삭제 후에는 복구할 수 없어요!」
 */
export function DeleteProductModal({
  open,
  product,
  onClose,
  onConfirm,
}: DeleteProductModalProps) {
  const handleConfirm = () => {
    if (!product) return;

    // TODO: 상품 삭제 API 연동
    onConfirm?.(product);
    showToast("상품이 삭제되었습니다.");
    onClose();
  };

  return (
    <Modal
      open={open && Boolean(product)}
      onClose={onClose}
      title="상품 삭제"
      description={
        <div>
          <p>
            <span className="text-snack-black-100">{product?.name}</span>
            <span> 상품을 삭제할까요?</span>
          </p>
          <p>상품 삭제 후에는 복구할 수 없어요!</p>
        </div>
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
        label: "삭제할래요",
        variant: "primary",
        onClick: handleConfirm,
      }}
    />
  );
}
