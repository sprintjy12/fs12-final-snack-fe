"use client";

import { useState } from "react";

import {
  PurchaseRequestDecisionModal,
  type PurchaseRequestDecisionMode,
  type PurchaseRequestDecisionTarget,
} from "@/app/(private)/purchase/requests/PurchaseRequestDecisionModal";
import { createMockDecisionTarget } from "@/app/(private)/purchase/requests/purchaseRequestDecisionMock";
import { Button } from "@/components/ui";

type PurchaseRequestDecisionActionsProps = {
  requestId: string;
  requester?: string;
};

/** 상세 페이지 하단 요청 반려/승인 버튼 + 폼 모달 */
export function PurchaseRequestDecisionActions({
  requestId,
  requester = "김스낵",
}: PurchaseRequestDecisionActionsProps) {
  const [mode, setMode] = useState<PurchaseRequestDecisionMode | null>(null);
  const [target, setTarget] = useState<PurchaseRequestDecisionTarget | null>(
    null,
  );

  const openModal = (nextMode: PurchaseRequestDecisionMode) => {
    const numericId = Number(requestId);

    setTarget(
      createMockDecisionTarget({
        id: Number.isFinite(numericId) ? numericId : 0,
        requester,
      }),
    );
    setMode(nextMode);
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
          className="flex-1 text-sm leading-6 xl:text-xl xl:leading-8"
          onClick={() => openModal("reject")}
        >
          요청 반려
        </Button>
        <Button
          type="button"
          width="full"
          className="flex-1 text-sm leading-6 xl:text-xl xl:leading-8"
          onClick={() => openModal("approve")}
        >
          요청 승인
        </Button>
      </div>

      <PurchaseRequestDecisionModal
        open={Boolean(mode && target)}
        mode={mode}
        request={target}
        onClose={closeModal}
      />
    </>
  );
}
