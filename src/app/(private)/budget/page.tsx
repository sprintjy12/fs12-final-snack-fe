"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";

import { Button, TextField, showToast } from "@/components/ui";
import { useUpdateBudgetSettings } from "@/hooks/mutations/useUpdateBudgetSettings";
import { useBudgetSettings } from "@/hooks/queries/useBudgetSettings";
import type { UpdateBudgetSettingsBody } from "@/types/budgetTypes";

/** BE INT32 상한과 동일 */
const MAX_BUDGET = 2_147_483_647;

/** Number 변환 없이 문자열로 천 단위 구분을 적용해 큰 수의 정밀도를 유지합니다. */
function formatBudgetValue(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const normalized = digits.replace(/^0+(?=\d)/, "");
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatBudgetAmount(amount: number | null | undefined) {
  if (amount === null || amount === undefined) {
    return "";
  }
  return formatBudgetValue(String(amount));
}

function toBudgetDigits(value: string) {
  return value.replaceAll(",", "").trim();
}

const startingBudgetSchema = z
  .string()
  .trim()
  .min(1, "매달 시작 예산을 입력해 주세요.")
  .refine(
    (value) => /^\d+$/.test(toBudgetDigits(value)),
    "매달 시작 예산은 숫자만 입력할 수 있어요.",
  )
  .refine((value) => {
    const amount = Number(toBudgetDigits(value));
    return Number.isInteger(amount) && amount >= 0;
  }, "예산은 0원 이상이어야 합니다.")
  .refine((value) => {
    const amount = Number(toBudgetDigits(value));
    return amount <= MAX_BUDGET;
  }, "예산이 너무 커요. 다시 입력해 주세요.");

/** 빈 값이면 기본값 따름(null). 값이 있으면 0 이상 정수. */
const monthlyBudgetSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d+$/.test(toBudgetDigits(value)),
    "이번 달 예산은 숫자만 입력할 수 있어요.",
  )
  .refine((value) => {
    if (value === "") {
      return true;
    }
    const amount = Number(toBudgetDigits(value));
    return Number.isInteger(amount) && amount >= 0;
  }, "예산은 0원 이상이어야 합니다.")
  .refine((value) => {
    if (value === "") {
      return true;
    }
    const amount = Number(toBudgetDigits(value));
    return amount <= MAX_BUDGET;
  }, "예산이 너무 커요. 다시 입력해 주세요.");

const budgetFormSchema = z.object({
  monthlyBudget: monthlyBudgetSchema,
  startingBudget: startingBudgetSchema,
});

function getBudgetToastMessage(
  error: z.ZodError<z.infer<typeof budgetFormSchema>>,
) {
  const { fieldErrors } = z.flattenError(error);
  const monthlyMessage = fieldErrors.monthlyBudget?.[0];
  const startingMessage = fieldErrors.startingBudget?.[0];

  return [monthlyMessage, startingMessage].filter(Boolean).join(" ");
}

function buildUpdateBody(params: {
  monthlyBudget: string;
  startingBudget: string;
  initialMonthly: number | null;
  initialStarting: number;
}): UpdateBudgetSettingsBody | null {
  const body: UpdateBudgetSettingsBody = {};
  const startingAmount = Number(toBudgetDigits(params.startingBudget));
  const monthlyDigits = toBudgetDigits(params.monthlyBudget);

  if (startingAmount !== params.initialStarting) {
    body.defaultMonthlyBudget = startingAmount;
  }

  if (monthlyDigits === "") {
    // 이미 기본값 따름(null)이면 변경 없음
    if (params.initialMonthly !== null) {
      body.monthlyBudget = null;
    }
  } else {
    const monthlyAmount = Number(monthlyDigits);
    if (monthlyAmount !== params.initialMonthly) {
      body.monthlyBudget = monthlyAmount;
    }
  }

  return Object.keys(body).length > 0 ? body : null;
}

export default function BudgetPage() {
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [startingBudget, setStartingBudget] = useState("");
  const [initialMonthly, setInitialMonthly] = useState<number | null>(null);
  const [initialStarting, setInitialStarting] = useState<number | null>(null);
  const [isFormReady, setIsFormReady] = useState(false);

  const { data, isPending, isError, error } = useBudgetSettings();
  const updateMutation = useUpdateBudgetSettings();

  useEffect(() => {
    const settings = data?.data;
    if (!settings || isFormReady) {
      return;
    }

    setMonthlyBudget(formatBudgetAmount(settings.currentMonth.amount));
    setStartingBudget(formatBudgetAmount(settings.defaultMonthlyBudget));
    setInitialMonthly(settings.currentMonth.amount);
    setInitialStarting(settings.defaultMonthlyBudget);
    setIsFormReady(true);
  }, [data?.data, isFormReady]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (updateMutation.isPending) {
      return;
    }

    if (initialStarting === null) {
      showToast("예산 설정을 불러온 뒤 다시 시도해 주세요.");
      return;
    }

    const result = budgetFormSchema.safeParse({
      monthlyBudget,
      startingBudget,
    });

    if (!result.success) {
      showToast(getBudgetToastMessage(result.error));
      return;
    }

    const body = buildUpdateBody({
      monthlyBudget: result.data.monthlyBudget,
      startingBudget: result.data.startingBudget,
      initialMonthly,
      initialStarting,
    });

    if (!body) {
      showToast("변경할 예산 값을 하나 이상 보내주세요.");
      return;
    }

    updateMutation.mutate(body, {
      onSuccess: (response) => {
        const settings = response.data;
        if (settings) {
          setMonthlyBudget(formatBudgetAmount(settings.currentMonth.amount));
          setStartingBudget(formatBudgetAmount(settings.defaultMonthlyBudget));
          setInitialMonthly(settings.currentMonth.amount);
          setInitialStarting(settings.defaultMonthlyBudget);
        } else if (typeof body.defaultMonthlyBudget === "number") {
          setInitialStarting(body.defaultMonthlyBudget);
          if (body.monthlyBudget === null) {
            setInitialMonthly(null);
          } else if (typeof body.monthlyBudget === "number") {
            setInitialMonthly(body.monthlyBudget);
          }
        } else if (body.monthlyBudget === null) {
          setInitialMonthly(null);
        } else if (typeof body.monthlyBudget === "number") {
          setInitialMonthly(body.monthlyBudget);
        }
        showToast(response.message || "예산이 변경되었습니다.");
      },
      onError: (mutationError) => {
        const message = isAxiosError(mutationError)
          ? ((mutationError.response?.data as { message?: string } | undefined)
              ?.message ?? mutationError.message)
          : mutationError instanceof Error
            ? mutationError.message
            : "예산 수정에 실패했습니다.";
        showToast(message);
      },
    });
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

        {isPending ? (
          <p className="mt-10 text-center text-foreground-muted md:mt-16">
            예산 설정을 불러오는 중…
          </p>
        ) : null}

        {isError ? (
          <p className="mt-10 text-center text-snack-state-100 md:mt-16">
            {error instanceof Error
              ? error.message
              : "예산 설정을 불러오지 못했습니다."}
          </p>
        ) : null}

        {!isPending && !isError && isFormReady ? (
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
                <TextField
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={monthlyBudget}
                  onChange={(event) =>
                    setMonthlyBudget(formatBudgetValue(event.target.value))
                  }
                  className="text-snack-gray-400 md:h-16 md:text-xl md:leading-8 xl:h-16"
                />
              </label>

              <label className="flex flex-col gap-2 md:gap-4">
                <span className="text-sm leading-6 font-medium text-foreground-strong md:text-xl md:leading-8">
                  매달 시작 예산
                </span>
                <TextField
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={startingBudget}
                  onChange={(event) =>
                    setStartingBudget(formatBudgetValue(event.target.value))
                  }
                  className="text-snack-gray-400 md:h-16 md:text-xl md:leading-8 xl:h-16"
                />
              </label>
            </div>

            <Button
              type="submit"
              width="full"
              className="mt-8 md:mt-14"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "수정 중…" : "수정하기"}
            </Button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
