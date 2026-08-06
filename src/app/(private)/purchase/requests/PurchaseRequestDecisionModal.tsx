"use client";

import Image from "next/image";
import { useEffect, useId, useState, type FormEvent } from "react";
import { z } from "zod";

import {
  Button,
  ModalShell,
  TextField,
  showToast,
} from "@/components/ui";

export type PurchaseRequestDecisionMode = "approve" | "reject";

export type PurchaseRequestDecisionItem = {
  id: number;
  category: string;
  name: string;
  unitPrice: string;
  quantity: number;
  totalPrice: string;
  imageSrc?: string;
};

export type PurchaseRequestDecisionTarget = {
  id: string;
  requester: string;
  itemCount: number;
  totalAmount: string;
  remainingBudget: string;
  items: readonly PurchaseRequestDecisionItem[];
};

export type PurchaseRequestDecisionModalProps = {
  open: boolean;
  mode: PurchaseRequestDecisionMode | null;
  request: PurchaseRequestDecisionTarget | null;
  onClose: () => void;
  onSubmit?: (values: {
    id: string;
    mode: PurchaseRequestDecisionMode;
    message: string;
  }) => void;
};

const COPY = {
  approve: {
    title: "구매 요청 승인",
    messageLabel: "승인 메시지",
    placeholder: "승인 메시지를 입력해주세요.",
    submitLabel: "승인하기",
    emptyMessage: "승인 메시지를 입력해 주세요.",
    successToast: "구매 요청을 승인했어요.",
  },
  reject: {
    title: "구매 요청 반려",
    messageLabel: "반려 메시지",
    placeholder: "반려 메시지를 입력해주세요.",
    submitLabel: "반려하기",
    emptyMessage: "반려 메시지를 입력해 주세요.",
    successToast: "구매 요청을 반려했어요.",
  },
} as const;

const createMessageSchema = (emptyMessage: string) =>
  z.object({
    message: z.string().trim().min(1, emptyMessage),
  });

/**
 * 구매 요청 승인/반려 폼 모달.
 * 시안상 양식은 동일하고 제목·메시지 라벨·CTA 카피만 다릅니다.
 */
export function PurchaseRequestDecisionModal({
  open,
  mode,
  request,
  onClose,
  onSubmit,
}: PurchaseRequestDecisionModalProps) {
  const titleId = useId();
  const messageId = useId();
  const [message, setMessage] = useState("");

  const isOpen = open && Boolean(mode) && Boolean(request);
  const copy = mode ? COPY[mode] : null;

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
    }
  }, [isOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!mode || !request || !copy) {
      return;
    }

    const result = createMessageSchema(copy.emptyMessage).safeParse({
      message,
    });

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      showToast(fieldErrors.message?.[0] ?? copy.emptyMessage);
      return;
    }

    // TODO: 구매 요청 승인/반려 API 연동
    onSubmit?.({
      id: request.id,
      mode,
      message: result.data.message,
    });
    showToast(copy.successToast);
    onClose();
  };

  return (
    <ModalShell
      open={isOpen}
      onClose={onClose}
      aria-labelledby={titleId}
      className={[
        "flex max-h-[min(1018px,calc(100dvh-24px))] max-w-[375px] flex-col overflow-hidden p-0",
        "md:max-w-[375px] md:rounded-[32px]",
        "xl:max-h-[min(1268px,calc(100dvh-48px))] xl:max-w-[688px]",
      ].join(" ")}
    >
      {copy && request ? (
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6 xl:gap-8 xl:px-6 xl:pt-8 xl:pb-10">
          <h2
            id={titleId}
            className="w-full text-xl leading-8 font-bold text-foreground-strong xl:text-2xl"
          >
            {copy.title}
          </h2>

          <div className="h-px w-full shrink-0 bg-border" />

          <form
            noValidate
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-6 xl:gap-8"
          >
            <div className="flex w-full flex-col gap-6 xl:gap-8">
              <div className="flex w-full flex-col gap-4">
                <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                  요청인
                </span>
                <TextField readOnlyBox>{request.requester}</TextField>
              </div>

              <div className="flex w-full flex-col gap-4">
                <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                  요청 품목
                </span>
                <div className="max-h-[280px] w-full overflow-y-auto rounded-2xl border border-solid border-snack-orange-300 bg-surface-muted p-6 shadow-[4px_4px_10px_rgba(250,247,243,0.25)] [scrollbar-color:var(--snack-gray-400)_transparent] [scrollbar-width:thin] xl:max-h-[360px] xl:p-10">
                  <ul className="flex flex-col gap-4 xl:gap-6">
                    {request.items.map((item, index) => (
                      <li
                        key={item.id}
                        className={[
                          "flex flex-col gap-4",
                          index < request.items.length - 1
                            ? "border-b border-solid border-border pb-4 xl:pb-6"
                            : "",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-solid border-border bg-surface-muted shadow-[4px_4px_10px_rgba(250,247,243,0.25)] xl:size-20">
                              <Image
                                src={
                                  item.imageSrc ??
                                  "/images/purchase-history-product.png"
                                }
                                alt=""
                                width={28}
                                height={49}
                                className="h-[49px] w-7 object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs leading-6 text-foreground-muted xl:text-sm xl:leading-6">
                                {item.category}
                              </p>
                              <p className="text-base leading-[26px] font-medium text-foreground-strong xl:text-lg xl:leading-[26px]">
                                {item.name}
                              </p>
                            </div>
                          </div>
                          <p className="shrink-0 text-base leading-[26px] font-semibold text-foreground-strong xl:text-lg xl:leading-[26px]">
                            {item.unitPrice}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-foreground-strong">
                          <p className="text-sm leading-6 font-medium xl:text-base xl:leading-[26px]">
                            수량: {item.quantity}개
                          </p>
                          <p className="text-xl leading-8 font-bold xl:text-2xl">
                            {item.totalPrice}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex w-full items-center justify-between">
                <p className="text-xl leading-8 font-bold text-foreground-strong xl:text-2xl">
                  총 {request.itemCount}건
                </p>
                <p className="text-2xl leading-8 font-bold text-accent xl:text-[32px] xl:leading-[42px]">
                  {request.totalAmount}
                </p>
              </div>

              <div className="flex w-full items-center justify-between">
                <p className="text-xl leading-8 font-bold text-foreground-strong xl:text-2xl">
                  남은 예산 금액
                </p>
                <p className="text-2xl leading-8 font-bold text-foreground-strong xl:text-[32px] xl:leading-[42px]">
                  {request.remainingBudget}
                </p>
              </div>

              <div className="h-px w-full shrink-0 bg-border" />

              <label className="flex w-full flex-col gap-4" htmlFor={messageId}>
                <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                  {copy.messageLabel}
                </span>
                <textarea
                  id={messageId}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={copy.placeholder}
                  rows={5}
                  className={[
                    "h-[120px] w-full resize-none rounded-2xl border border-solid border-snack-orange-300 bg-surface px-4 py-3.5",
                    "text-sm leading-6 text-foreground outline-none placeholder:text-snack-gray-400",
                    "xl:h-40 xl:px-6 xl:text-lg xl:leading-[26px]",
                  ].join(" ")}
                />
              </label>
            </div>

            <div className="flex w-full items-center justify-between gap-3 xl:gap-5">
              <Button
                type="button"
                variant="secondary"
                width="modal"
                className="flex-1"
                onClick={onClose}
              >
                취소
              </Button>
              <Button type="submit" width="modal" className="flex-1">
                {copy.submitLabel}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </ModalShell>
  );
}
