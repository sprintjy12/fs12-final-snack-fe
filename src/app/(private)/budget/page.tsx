"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { z } from "zod";

import { showToast } from "@/components/ui";

const MAX_SAFE_BUDGET = BigInt(Number.MAX_SAFE_INTEGER);

/** Number 변환 없이 문자열로 천 단위 구분을 적용해 큰 수의 정밀도를 유지합니다. */
function formatBudgetValue(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const normalized = digits.replace(/^0+(?=\d)/, "");
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function toBudgetDigits(value: string) {
  return value.replaceAll(",", "").trim();
}

const createBudgetFieldSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label}을 입력해 주세요.`)
    .refine(
      (value) => /^\d+$/.test(toBudgetDigits(value)),
      `${label}은 숫자만 입력할 수 있어요.`,
    )
    .refine((value) => {
      const digits = toBudgetDigits(value);
      return BigInt(digits) <= MAX_SAFE_BUDGET;
    }, `${label}이 너무 커요. 다시 입력해 주세요.`);

const budgetFormSchema = z.object({
  monthlyBudget: createBudgetFieldSchema("이번 달 예산"),
  startingBudget: createBudgetFieldSchema("매달 시작 예산"),
});

function getBudgetToastMessage(
  error: z.ZodError<z.infer<typeof budgetFormSchema>>,
) {
  const { fieldErrors } = z.flattenError(error);
  const monthlyMessage = fieldErrors.monthlyBudget?.[0];
  const startingMessage = fieldErrors.startingBudget?.[0];

  // 문구 매칭 대신 too_small(빈 값) 코드로 구분합니다.
  const isMonthlyMissing = error.issues.some(
    (issue) => issue.path[0] === "monthlyBudget" && issue.code === "too_small",
  );
  const isStartingMissing = error.issues.some(
    (issue) => issue.path[0] === "startingBudget" && issue.code === "too_small",
  );

  if (isMonthlyMissing && isStartingMissing) {
    return "이번 달 예산, 매달 시작 예산을 입력해 주세요.";
  }

  return [monthlyMessage, startingMessage].filter(Boolean).join(" ");
}

export default function BudgetPage() {
  const [monthlyBudget, setMonthlyBudget] = useState("3,500,000");
  const [startingBudget, setStartingBudget] = useState("3,000,000");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = budgetFormSchema.safeParse({
      monthlyBudget,
      startingBudget,
    });

    if (!result.success) {
      showToast(getBudgetToastMessage(result.error));
      return;
    }

    // TODO: 예산 수정 API 연동
    // 정밀도 유지를 위해 숫자 문자열로 전달하거나, 도메인 검증 후 변환합니다.
    // const payload = {
    //   monthlyBudget: toBudgetDigits(result.data.monthlyBudget),
    //   startingBudget: toBudgetDigits(result.data.startingBudget),
    // };
    showToast("예산이 변경되었습니다.");
  };

  return (
    <main className="min-h-screen bg-surface-muted text-foreground">
      {/* 관리 하위 탭 — Mobile 시안에는 없고 Tablet/Desktop만 존재 */}
      <nav
        aria-label="관리 메뉴"
        className="hidden border-b border-border bg-surface-muted md:block"
      >
        <div className="mx-auto flex max-w-[1680px] items-center gap-3 px-6 xl:h-16 xl:px-[120px]">
          <Link
            href="/admin"
            className="flex items-center justify-center px-2.5 py-3.5 text-sm leading-6 font-medium text-snack-gray-400 xl:h-16 xl:px-4 xl:text-lg xl:leading-[26px]"
          >
            회원 관리
          </Link>
          <Link
            href="/budget"
            aria-current="page"
            className="flex items-center justify-center border-b-2 border-accent px-2.5 py-3.5 text-sm leading-6 font-bold text-accent xl:h-16 xl:px-2.5 xl:text-lg xl:leading-[26px]"
          >
            예산 관리
          </Link>
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center px-6 pt-24 pb-20 md:px-0 md:pt-[60px] xl:pt-[91px]">
        <h1 className="text-center text-2xl leading-8 font-semibold text-foreground-strong md:text-[32px] md:leading-[42px]">
          예산 관리
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex w-full flex-col items-stretch md:mt-16"
          noValidate
        >
          <div className="flex flex-col gap-4 border-y border-snack-gray-200 py-4 md:gap-8 md:py-8">
            <label className="flex flex-col gap-2 md:gap-4">
              <span className="text-sm leading-6 font-medium text-foreground-strong md:text-xl md:leading-8">
                이번 달 예산
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={monthlyBudget}
                onChange={(event) =>
                  setMonthlyBudget(formatBudgetValue(event.target.value))
                }
                className="h-[54px] w-full rounded-2xl border border-snack-orange-300 bg-surface px-3.5 text-sm leading-6 text-snack-gray-400 outline-none md:h-16 md:text-xl md:leading-8"
              />
            </label>

            <label className="flex flex-col gap-2 md:gap-4">
              <span className="text-sm leading-6 font-medium text-foreground-strong md:text-xl md:leading-8">
                매달 시작 예산
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={startingBudget}
                onChange={(event) =>
                  setStartingBudget(formatBudgetValue(event.target.value))
                }
                className="h-[54px] w-full rounded-2xl border border-snack-orange-300 bg-surface px-3.5 text-sm leading-6 text-snack-gray-400 outline-none md:h-16 md:text-xl md:leading-8"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-8 flex h-[54px] w-full cursor-pointer items-center justify-center rounded-2xl bg-accent p-4 text-base leading-[26px] font-semibold text-surface md:mt-14 md:h-16 md:text-xl md:leading-8"
          >
            수정하기
          </button>
        </form>
      </div>
    </main>
  );
}
