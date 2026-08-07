"use client";

import { useState } from "react";

import { Button, showToast, useToast } from "@/components/ui";

/**
 * 토스트 샘플 페이지
 *
 * Figma Toast (성공 안내) 공통 컴포넌트 사용 예시입니다.
 * - 문구(message)를 직접 넣어 호출합니다.
 * - Mobile: 화면 가로 전체 / Tablet·Desktop: 524px, 헤더 바로 아래 중앙
 *
 * 호출 방법 2가지:
 * 1) showToast("메시지") — Provider만 있으면 어디서든 호출
 * 2) useToast().showToast("메시지") — 훅으로 호출
 *
 * options.duration:
 * - 기본 3000ms 후 자동 닫힘
 * - 0이면 X 버튼으로만 닫힘
 */
export default function ToastSamplePage() {
  const { showToast: showToastFromHook } = useToast();
  const [message, setMessage] = useState("예산이 변경되었습니다.");

  return (
    <main className="min-h-screen bg-surface-muted px-6 py-16 text-foreground">
      <div className="mx-auto flex max-w-[640px] flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-foreground-strong">
            토스트 샘플
          </h1>
          <p className="text-base leading-[26px] text-foreground-muted">
            성공 안내 Toast입니다. 문구만 바꿔서 재사용하면 됩니다. 반응형은
            모바일 풀폭 / 태블릿·PC 524px 고정입니다.
          </p>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground-strong">
            토스트 문구
          </span>
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="표시할 문구를 입력하세요"
            className="h-14 rounded-2xl border border-border bg-surface px-4 text-base text-foreground outline-none focus:border-accent"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            size="compact"
            onClick={() => showToast(message || "예산이 변경되었습니다.")}
          >
            showToast로 열기
          </Button>

          <Button
            size="compact"
            variant="secondary"
            onClick={() =>
              showToastFromHook(message || "예산이 변경되었습니다.")
            }
          >
            useToast로 열기
          </Button>

          <Button
            size="compact"
            variant="outline"
            onClick={() =>
              showToast(message || "예산이 변경되었습니다.", { duration: 0 })
            }
          >
            수동 닫기만 (duration: 0)
          </Button>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-5 text-sm leading-6 text-foreground-muted">
          <p className="mb-2 font-semibold text-foreground-strong">사용 예시</p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-surface-muted p-4 text-[13px] leading-5 text-foreground">
            {`import { showToast } from "@/components/ui";

// 기본 (3초 후 자동 닫힘)
showToast("예산이 변경되었습니다.");

// 닫힘 시간 변경
showToast("저장되었습니다.", { duration: 5000 });

// X 버튼으로만 닫기
showToast("확인이 필요합니다.", { duration: 0 });`}
          </pre>
        </section>
      </div>
    </main>
  );
}
