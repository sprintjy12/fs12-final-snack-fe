"use client";

import { isAxiosError } from "axios";

import { CommonImage, Modal, showToast } from "@/components/ui";
import { useDeleteProduct } from "@/hooks/mutations/useDeleteProduct";

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
  const deleteMutation = useDeleteProduct();

  const handleClose = () => {
    if (deleteMutation.isPending) {
      return;
    }
    onClose();
  };

  const handleConfirm = () => {
    if (!product || deleteMutation.isPending) {
      return;
    }

    deleteMutation.mutate(product.id, {
      onSuccess: () => {
        onConfirm?.(product);
        showToast("상품이 삭제되었습니다.");
        onClose();
      },
      onError: (error) => {
        const message = isAxiosError(error)
          ? ((error.response?.data as { message?: string } | undefined)
              ?.message ?? error.message)
          : error instanceof Error
            ? error.message
            : "상품 삭제에 실패했습니다.";
        showToast(message);
      },
    });
  };

  return (
    <Modal
      open={open && Boolean(product)}
      onClose={handleClose}
      closeOnOverlayClick={!deleteMutation.isPending}
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
        onClick: handleClose,
      }}
      primaryAction={{
        label: deleteMutation.isPending ? "삭제 중…" : "삭제할래요",
        variant: "primary",
        onClick: handleConfirm,
      }}
    />
  );
}
