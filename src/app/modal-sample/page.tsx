"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import {
  Button,
  CommonImage,
  Modal,
  ModalShell,
  Select,
  TextField,
} from "@/components/ui";

/**
 * 모달 샘플 페이지
 *
 * =====================================================
 * 모달 구조 (리팩터 이후)
 *
 * 1) ModalShell  — 공통 껍데기
 * 2) Modal       — 확인/결과 안내 (일러스트형)
 * 3) 폼 모달     — ModalShell + TextField / Select / Button
 * =====================================================
 */
type ModalType = "result" | "warning" | "form" | null;

type Role = "admin" | "member";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "관리자" },
  { value: "member", label: "일반" },
];

export default function ModalSamplePage() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [role, setRole] = useState<Role>("admin");
  const formTitleId = useId();
  const roleLabelId = useId();

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
          <Button
            size="compact"
            onClick={() => setOpenModal("result")}
          >
            일반 강아지 모달 열기
          </Button>

          <Button
            size="compact"
            variant="secondary"
            onClick={() => setOpenModal("warning")}
          >
            warning 강아지 모달 열기
          </Button>

          <Button
            size="compact"
            variant="outline"
            onClick={() => setOpenModal("form")}
          >
            폼 모달(Shell) 열기
          </Button>
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
              <code className="text-foreground">ModalShell</code> +{" "}
              <code className="text-foreground">TextField</code> /{" "}
              <code className="text-foreground">Select</code> /{" "}
              <code className="text-foreground">Button</code>
            </li>
          </ul>
        </section>
      </div>

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
            closeModal();
            router.push("/admin");
          },
        }}
      />

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
            closeModal();
          }}
        >
          <label className="flex flex-col gap-2 md:gap-4">
            <span className="text-sm leading-6 font-semibold text-foreground-strong md:text-xl md:leading-8">
              이름
            </span>
            <TextField
              type="text"
              placeholder="이름을 입력해주세요"
              className="md:h-16 md:text-xl md:leading-8 xl:h-16"
            />
          </label>

          <label className="flex flex-col gap-2 md:gap-4">
            <span className="text-sm leading-6 font-semibold text-foreground-strong md:text-xl md:leading-8">
              이메일
            </span>
            <TextField
              type="email"
              placeholder="이메일을 입력해주세요"
              className="md:h-16 md:text-xl md:leading-8 xl:h-16"
            />
          </label>

          <div className="flex flex-col gap-2 md:gap-4">
            <span
              id={roleLabelId}
              className="text-sm leading-6 font-semibold text-foreground-strong md:text-xl md:leading-8"
            >
              권한
            </span>
            <Select
              options={ROLE_OPTIONS}
              value={role}
              onChange={setRole}
              labelId={roleLabelId}
              flipChevron={false}
            />
          </div>

          <div className="flex flex-col-reverse gap-4 md:flex-row md:justify-between md:gap-5">
            <Button
              type="button"
              variant="secondary"
              width="modal"
              className="md:h-16 md:w-[310px] md:text-xl md:leading-8"
              onClick={closeModal}
            >
              취소
            </Button>
            <Button
              type="submit"
              width="modal"
              className="md:h-16 md:w-[310px] md:text-xl md:leading-8"
            >
              등록하기
            </Button>
          </div>
        </form>
      </ModalShell>
    </main>
  );
}
