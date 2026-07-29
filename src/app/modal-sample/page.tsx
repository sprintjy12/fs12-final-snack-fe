"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CommonImage, Modal } from "@/components/ui";

/**
 * 모달 샘플 페이지
 *
 * 이 프로젝트의 일러스트 모달은 크게 2가지입니다.
 * 1) 일반 강아지 (`modal-approve` / `modal-reject`) — 결과 안내
 * 2) 느낌표 강아지 (`modal-warning`) — 한 번 더 확인이 필요한 경고
 *
 * 공통 호출 패턴:
 * - open / onClose 로 열기·닫기
 * - title / description / illustration 로 내용 구성
 * - secondaryAction / primaryAction 으로 버튼 2개 구성
 *
 * 버튼 동작은 페이지마다 다르게 넘기면 됩니다.
 * - onClick만: API 호출, 상태 변경, 모달 닫기 등
 * - href만: 해당 경로로 이동 (Link)
 * - href + onClick: 이동 전에 로컬 정리(모달 닫기 등) 실행 후 이동
 */
type ModalType = "result" | "warning" | null;

export default function ModalSamplePage() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<ModalType>(null);

  const closeModal = () => setOpenModal(null);

  return (
    <main className="min-h-screen bg-surface-muted px-6 py-16 text-foreground">
      <div className="mx-auto flex max-w-[640px] flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground-strong">
          모달 샘플
        </h1>
        <p className="text-base leading-[26px] text-foreground-muted">
          일반 강아지 / warning 강아지 모달 호출 예시입니다. 버튼 동작은
          `onClick` 또는 `href`로 페이지마다 다르게 연결하면 됩니다.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* 1) 일반 강아지 모달 열기 */}
          <button
            type="button"
            onClick={() => setOpenModal("result")}
            className="flex h-14 cursor-pointer items-center justify-center rounded-2xl bg-accent px-6 text-base font-semibold text-surface"
          >
            일반 강아지 모달 열기
          </button>

          {/* 2) warning 강아지 모달 열기 */}
          <button
            type="button"
            onClick={() => setOpenModal("warning")}
            className="flex h-14 cursor-pointer items-center justify-center rounded-2xl bg-snack-background-500 px-6 text-base font-semibold text-accent"
          >
            warning 강아지 모달 열기
          </button>
        </div>
      </div>

      {/*
        [예시 1] 결과 안내 모달 (일반 강아지)
        - illustration: CommonImage name="modal-approve" (또는 modal-reject)
        - secondaryAction.href: 홈으로 이동
        - primaryAction.href: 구매 내역 페이지로 이동
        - onClick에서 closeModal()을 같이 호출해 이동 전 모달을 닫습니다.
      */}
      <Modal
        open={openModal === "result"}
        onClose={closeModal}
        title="승인 완료"
        description={
          <>
            <p>승인이 완료되었어요!</p>
            <p>구매 내역을 통해 배송현황을 확인해보세요</p>
          </>
        }
        illustration={
          <CommonImage
            name="modal-approve"
            size="md"
            className="h-full w-full"
          />
        }
        secondaryAction={{
          label: "홈으로",
          variant: "secondary",
          href: "/",
          onClick: closeModal,
        }}
        primaryAction={{
          label: "구매 내역 보기",
          variant: "primary",
          href: "/purchase/history",
          onClick: closeModal,
        }}
      />

      {/*
        [예시 2] 경고 확인 모달 (느낌표 강아지)
        - illustration: CommonImage name="modal-warning"
        - secondaryAction.onClick: 모달만 닫기
        - primaryAction.onClick: 실제 작업(예: 탈퇴 API) 후 원하는 페이지로 이동
          → href 대신 router.push를 쓰면 API 성공 후에만 이동시킬 수 있습니다.
      */}
      <Modal
        open={openModal === "warning"}
        onClose={closeModal}
        title="계정 탈퇴"
        description={
          <p>
            <span className="text-snack-black-100">
              김스낵(sn@codeit.com)
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
          onClick: closeModal,
        }}
        primaryAction={{
          label: "탈퇴시키기",
          variant: "primary",
          onClick: () => {
            // TODO: 실제 페이지에서는 탈퇴 API 호출 후 성공 시 이동
            // await deleteMember(memberId);
            closeModal();
            router.push("/admin");
          },
        }}
      />
    </main>
  );
}
