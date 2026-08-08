"use client";

import { useState } from "react";

import {
  PurchaseRequestDecisionModal,
  type PurchaseRequestDecisionMode,
  type PurchaseRequestDecisionTarget,
} from "@/app/(private)/purchase/requests/PurchaseRequestDecisionModal";
import { mapOrderRequestDetailToDecisionTarget } from "@/app/(private)/purchase/requests/mapOrderRequestDetailToDecisionTarget";
import { BUDGET_EXCEEDED_MESSAGE } from "@/app/(private)/purchase/requests/orderRequestBudget";
import { Button, showToast } from "@/components/ui";
import { useFetchOrderRequestDetail } from "@/hooks/queries/useOrderRequestDetail";

type PurchaseRequestDecisionActionsProps = {
  requestId: string;
  /** 예산 초과 시 승인 버튼 비활성화 */
  approveDisabled?: boolean;
};

/** 상세 페이지 하단 요청 반려/승인 버튼 + 폼 모달 */
export function PurchaseRequestDecisionActions({
  requestId,
  approveDisabled = false,
}: PurchaseRequestDecisionActionsProps) {
  const fetchOrderRequestDetail = useFetchOrderRequestDetail();
  const [mode, setMode] = useState<PurchaseRequestDecisionMode | null>(null);
  const [target, setTarget] = useState<PurchaseRequestDecisionTarget | null>(
    null,
  );
  const [isOpening, setIsOpening] = useState(false);

  const openModal = async (nextMode: PurchaseRequestDecisionMode) => {
    if (isOpening) {
      return;
    }

    if (nextMode === "approve" && approveDisabled) {
      showToast(BUDGET_EXCEEDED_MESSAGE);
      return;
    }

    setIsOpening(true);
    try {
      const response = await fetchOrderRequestDetail(requestId);
      setTarget(mapOrderRequestDetailToDecisionTarget(response.data));
      setMode(nextMode);
    } catch {
      showToast("구매 요청 상세를 불러오지 못했습니다.");
    } finally {
      setIsOpening(false);
    }
  };

  const closeModal = () => {
    setMode(null);
    setTarget(null);
  };

  return (
    <>
      <div className="mt-8 flex w-full gap-3 md:mt-16 md:w-[696px] md:gap-5 xl:mt-6 xl:w-full xl:gap-[23px]">
        <Button
          type="button"
          variant="muted"
          width="full"
          disabled={isOpening}
          className="flex-1 text-sm leading-6 xl:text-xl xl:leading-8"
          onClick={() => openModal("reject")}
        >
          요청 반려
        </Button>
        <Button
          type="button"
          width="full"
          disabled={isOpening || approveDisabled}
          className={[
            "flex-1 text-center text-sm leading-6 xl:text-xl xl:leading-8",
            approveDisabled
              ? "border border-solid border-snack-gray-200 !bg-snack-background-400 !text-snack-gray-400 disabled:!opacity-100"
              : "",
          ].join(" ")}
          onClick={() => openModal("approve")}
        >
          요청 승인
        </Button>
      </div>

      <PurchaseRequestDecisionModal
        open={Boolean(mode && target)}
        mode={mode}
        request={target}
        showResultModal
        onClose={closeModal}
      />
    </>
  );
}
