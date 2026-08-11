"use client";

import { isAxiosError } from "axios";

import { Button, showToast } from "@/components/ui";
import { useAddCartItems } from "@/hooks/mutations/useAddToCart";
import type { OrderDetailItem } from "@/types/orderTypes";

type MyRequestDetailActionsProps = {
  purchaseId: string;
  items: OrderDetailItem[];
};

/**
 * 내 구매 요청 상세 하단 CTA — 목록 보기 / 장바구니에 다시 담기.
 */
export function MyRequestDetailActions({
  purchaseId,
  items,
}: MyRequestDetailActionsProps) {
  const addCartItemsMutation = useAddCartItems();

  const handleAddToCart = () => {
    if (addCartItemsMutation.isPending) {
      return;
    }

    const cartItems = items
      .filter(
        (item): item is OrderDetailItem & { productId: string } =>
          Boolean(item.productId) && item.quantity > 0,
      )
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

    if (cartItems.length === 0) {
      showToast("장바구니에 담을 상품이 없어요.");
      return;
    }

    addCartItemsMutation.mutate(
      { items: cartItems },
      {
        onSuccess: ({ successCount, failedCount }) => {
          if (failedCount > 0) {
            showToast(
              `${successCount}개 상품을 담았어요. ${failedCount}개는 실패했어요.`,
            );
            return;
          }
          showToast("장바구니에 다시 담았어요.");
        },
        onError: (error) => {
          const message = isAxiosError(error)
            ? ((error.response?.data as { message?: string } | undefined)
                ?.message ?? error.message)
            : error instanceof Error
              ? error.message
              : "장바구니에 담지 못했습니다.";
          showToast(message);
        },
      },
    );
  };

  return (
    <div
      className="mt-8 flex w-full gap-3 md:mt-16 md:w-[696px] md:gap-5 xl:mt-6 xl:w-full xl:gap-[23px]"
      data-purchase-id={purchaseId}
    >
      <Button
        href="/purchase/my-requests"
        variant="secondary"
        width="full"
        className="flex-1 text-sm leading-6 xl:text-xl xl:leading-8"
      >
        목록 보기
      </Button>
      <Button
        type="button"
        width="full"
        className="flex-1 text-sm leading-6 xl:text-xl xl:leading-8"
        disabled={addCartItemsMutation.isPending}
        onClick={handleAddToCart}
      >
        {addCartItemsMutation.isPending
          ? "담는 중…"
          : "장바구니에 다시 담기"}
      </Button>
    </div>
  );
}
