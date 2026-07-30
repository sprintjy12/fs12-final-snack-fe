"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { CommonImage, Icon, Modal, ModalShell } from "@/components/ui";

/**
 * 모달 샘플 페이지
 *
 * =====================================================
 * 모달 구조 (리팩터 이후)
 *
 * 1) ModalShell  — 공통 껍데기
 *    - 오버레이, portal, Esc 닫기, body 스크롤 잠금
 *    - 확인 모달·폼 모달 모두 이 셸을 씁니다.
 *
 * 2) Modal       — 확인/결과 안내 (일러스트형)
 *    - 일반 강아지 / warning 강아지
 *    - title + description + illustration + 버튼
 *    - 기존 호출 API 그대로 사용하면 됩니다.
 *
 * 3) 폼 모달     — ModalShell + 페이지/도메인별 폼 UI
 *    - 회원 초대처럼 입력 필드가 있는 시안은
 *      Modal props를 억지로 늘리지 말고 Shell 위에 직접 구성합니다.
 *    - 아래 [예시 3]이 그 패턴입니다.
 * =====================================================
 */
type ModalType = "result" | "warning" | "form" | null;

export default function ModalSamplePage() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const formTitleId = useId();

  const closeModal = () => setOpenModal(null);

  return (
    <main className="min-h-screen bg-surface-muted px-6 py-16 text-foreground">
      <div className="mx-auto flex max-w-[640px] flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground-strong">
          모달 샘플
        </h1>
        <p className="text-base leading-[26px] text-foreground-muted">
          확인 모달(`Modal`)과 폼 모달(`ModalShell`) 호출 예시입니다. 버튼
          동작은 `onClick` / `href`로 페이지마다 다르게 연결하면 됩니다.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

          {/* 3) 폼 모달(Shell) 열기 */}
          <button
            type="button"
            onClick={() => setOpenModal("form")}
            className="flex h-14 cursor-pointer items-center justify-center rounded-2xl border border-border bg-surface px-6 text-base font-semibold text-foreground-strong"
          >
            폼 모달(Shell) 열기
          </button>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-5 text-sm leading-6 text-foreground-muted">
          <p className="mb-2 font-semibold text-foreground-strong">선택 가이드</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              결과/경고처럼 일러스트 + 문구 + 버튼만 있으면 →{" "}
              <code className="text-foreground">Modal</code>
            </li>
            <li>
              회원 초대처럼 입력·드롭다운이 있으면 →{" "}
              <code className="text-foreground">ModalShell</code> + 폼 UI
            </li>
          </ul>
        </section>
      </div>

      {/*
        [예시 1] 결과 안내 모달 (일반 강아지) — Modal 사용
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
        [예시 2] 경고 확인 모달 (느낌표 강아지) — Modal 사용
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

      {/*
        [예시 3] 폼 모달 — ModalShell 사용
        - 회원 초대/권한 변경처럼 입력 폼이 있는 시안에 쓰는 패턴입니다.
        - Shell은 오버레이·Esc만 담당하고, 제목·필드·버튼 배치는 시안대로 직접 둡니다.
        - 실제 회원 초대 모달은 admin 페이지에서 이 패턴으로 전용 컴포넌트를 만들면 됩니다.
      */}
      <ModalShell
        open={openModal === "form"}
        onClose={closeModal}
        aria-labelledby={formTitleId}
        className="flex max-w-[375px] flex-col gap-6 px-6 pt-8 pb-10 md:max-w-[688px] md:gap-8 md:px-6 md:pt-8 md:pb-10"
      >
        <h2
          id={formTitleId}
          className="w-full text-left text-xl leading-8 font-bold text-foreground-strong md:text-2xl"
        >
          회원 초대 (예시)
        </h2>

        <div className="h-px w-full bg-border" />

        <form
          className="flex w-full flex-col gap-6 md:gap-8"
          onSubmit={(event) => {
            event.preventDefault();
            // TODO: 실제 페이지에서는 초대 API 호출
            closeModal();
          }}
        >
          <label className="flex flex-col gap-2 md:gap-4">
            <span className="text-sm leading-6 font-semibold text-foreground-strong md:text-xl md:leading-8">
              이름
            </span>
            <input
              type="text"
              placeholder="이름을 입력해주세요"
              className="h-[54px] w-full rounded-2xl border border-snack-orange-300 bg-surface px-3.5 text-sm leading-6 text-foreground outline-none placeholder:text-snack-gray-400 md:h-16 md:text-xl md:leading-8"
            />
          </label>

          <label className="flex flex-col gap-2 md:gap-4">
            <span className="text-sm leading-6 font-semibold text-foreground-strong md:text-xl md:leading-8">
              이메일
            </span>
            <input
              type="email"
              placeholder="이메일을 입력해주세요"
              className="h-[54px] w-full rounded-2xl border border-snack-orange-300 bg-surface px-3.5 text-sm leading-6 text-foreground outline-none placeholder:text-snack-gray-400 md:h-16 md:text-xl md:leading-8"
            />
          </label>

          <label className="flex flex-col gap-2 md:gap-4">
            <span className="text-sm leading-6 font-semibold text-foreground-strong md:text-xl md:leading-8">
              권한
            </span>
            <div className="relative">
              <select
                defaultValue="admin"
                className="h-[54px] w-full appearance-none rounded-2xl border border-snack-orange-300 bg-surface px-3.5 pr-12 text-sm leading-6 text-foreground outline-none md:h-16 md:text-xl md:leading-8"
              >
                <option value="admin">관리자</option>
                <option value="member">일반</option>
              </select>
              <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-accent">
                <Icon name="chevron-down" size="sm" className="md:hidden" />
                <span className="hidden md:inline-flex">
                  <Icon name="chevron-down" size="md" />
                </span>
              </span>
            </div>
          </label>

          <div className="flex flex-col-reverse gap-4 md:flex-row md:justify-between md:gap-5">
            <button
              type="button"
              onClick={closeModal}
              className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-2xl bg-snack-background-500 p-4 text-base leading-[26px] font-semibold text-accent md:h-16 md:w-[310px] md:text-xl md:leading-8"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-2xl bg-accent p-4 text-base leading-[26px] font-semibold text-surface md:h-16 md:w-[310px] md:text-xl md:leading-8"
            >
              등록하기
            </button>
          </div>
        </form>
      </ModalShell>
    </main>
  );
}
