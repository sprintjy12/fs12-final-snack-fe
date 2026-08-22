"use client";

import Link from "next/link";
import { useMemo, useState, type ChangeEvent } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import BudgetSectionTabs from "@/components/BudgetSectionTabs";
import { useMonthlyBudgetSummary } from "@/hooks/queries/useMonthlyBudgetSummary";
import type {
  MonthlyBudgetCategory,
  MonthlyBudgetSubcategory,
} from "@/types/budgetTypes";

const CHART_COLORS = [
  "#FF6B00",
  "#FF8A1F",
  "#FFA33D",
  "#FFB85C",
  "#FFCC7A",
  "#FFDEA3",
  "#E2BA8D",
  "#C99C72",
  "#A98264",
  "#80634F",
] as const;
const ETC_COLOR = "#D9D0C7";

type DisplayCategory = MonthlyBudgetCategory & {
  color: string;
};

function getCurrentKstYearMonth() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return year && month ? `${year}-${month}` : "";
}

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatPercentage(percentage: number) {
  return `${percentage.toFixed(2)}%`;
}

function formatMonthLabel(yearMonth: string) {
  const month = Number(yearMonth.split("-")[1]);
  return Number.isInteger(month) && month >= 1 && month <= 12
    ? `${month}월`
    : "선택 월";
}

function buildDisplayCategories(
  categories: MonthlyBudgetCategory[],
  productAmount: number,
): DisplayCategory[] {
  const normalizedCategories = categories.map((category) => ({
    ...category,
    percentage:
      productAmount > 0 ? (category.amount / productAmount) * 100 : 0,
  }));
  const regularCategories = normalizedCategories.filter(
    (category) => category.name !== "기타",
  );
  const etcCategories = normalizedCategories.filter(
    (category) => category.name === "기타",
  );

  const result: DisplayCategory[] = regularCategories.map(
    (category, index) => ({
      ...category,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }),
  );

  if (etcCategories.length > 0) {
    const amount = etcCategories.reduce(
      (total, category) => total + category.amount,
      0,
    );
    const children: MonthlyBudgetSubcategory[] = etcCategories.flatMap(
      (category) => {
        if (category.name === "기타" && category.children.length > 0) {
          return category.children;
        }

        return [
          {
            name:
              category.name === "기타"
                ? "카테고리 정보 없음"
                : category.name,
            amount: category.amount,
            percentage: category.percentage,
          },
        ];
      },
    );

    result.push({
      name: "기타",
      amount,
      percentage: productAmount > 0 ? (amount / productAmount) * 100 : 0,
      children: children.sort((a, b) => b.amount - a.amount),
      color: ETC_COLOR,
    });
  }

  return result.sort((a, b) => b.amount - a.amount);
}

function DonutChart({
  categories,
  productAmount,
}: {
  categories: DisplayCategory[];
  productAmount: number;
}) {
  return (
    <div className="flex justify-center">
      <div
        role="img"
        aria-label={`상품 구매 금액 ${formatWon(productAmount)}의 대분류별 지출 도넛 차트`}
        className="relative size-[260px] md:hidden"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart aria-hidden="true">
            <Pie
              data={categories}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={57}
              outerRadius={87}
              stroke="none"
              isAnimationActive={false}
            >
              {categories.map((category) => (
                <Cell key={category.name} fill={category.color} />
              ))}
            </Pie>
            <text
              x="50%"
              y="47%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#8A847E"
              fontSize="14"
            >
              상품 구매 금액
            </text>
            <text
              x="50%"
              y="57%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#2D2926"
              fontSize="20"
              fontWeight="700"
            >
              {formatWon(productAmount)}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div
        role="img"
        aria-label={`상품 구매 금액 ${formatWon(productAmount)}의 대분류별 지출 도넛 차트`}
        className="hidden h-[360px] w-full max-w-[440px] md:block"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart aria-hidden="true">
            <Pie
              data={categories}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={64}
              outerRadius={96}
              stroke="none"
              labelLine={{ stroke: "#C9B7A5", strokeWidth: 1 }}
              label={(props) => (
                <text
                  x={props.x}
                  y={props.y}
                  textAnchor={props.textAnchor}
                  dominantBaseline="central"
                  fill="#5F5A55"
                  fontSize="14"
                  fontWeight="600"
                >
                  {props.name}
                </text>
              )}
              isAnimationActive={false}
            >
              {categories.map((category) => (
                <Cell key={category.name} fill={category.color} />
              ))}
            </Pie>
            <text
              x="50%"
              y="47%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#8A847E"
              fontSize="14"
            >
              상품 구매 금액
            </text>
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#2D2926"
              fontSize="20"
              fontWeight="700"
            >
              {formatWon(productAmount)}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function BudgetStatisticsPage() {
  const [yearMonth, setYearMonth] = useState(getCurrentKstYearMonth);
  const { data, isPending, isError, error } =
    useMonthlyBudgetSummary(yearMonth);
  const summary = data?.data;
  const displayCategories = useMemo(
    () =>
      buildDisplayCategories(
        summary?.categories ?? [],
        summary?.productAmount ?? 0,
      ),
    [summary?.categories, summary?.productAmount],
  );

  const handleYearMonthChange = (event: ChangeEvent<HTMLInputElement>) => {
    setYearMonth(event.target.value);
  };

  const monthLabel = summary
    ? formatMonthLabel(summary.yearMonth)
    : "선택 월";
  const summaryCards = summary
    ? [
        {
          label: `${monthLabel} 예산`,
          amount: summary.isUnlimited ? "무제한" : formatWon(summary.budget),
          description: summary.isUnlimited
            ? "예산 제한 없이 사용할 수 있어요"
            : `${summary.yearMonth}에 적용된 예산이에요`,
        },
        {
          label: `${monthLabel} 총지출`,
          amount: formatWon(summary.spent),
          description: "상품 구매 금액과 배송비를 포함해요",
        },
        {
          label:
            !summary.isUnlimited &&
            summary.remaining !== null &&
            summary.remaining < 0
              ? `${monthLabel} 초과 금액`
              : `${monthLabel} 잔액`,
          amount: summary.isUnlimited
            ? "제한 없음"
            : formatWon(Math.abs(summary.remaining ?? 0)),
          description: summary.isUnlimited
            ? "무제한 예산이 적용되었어요"
            : summary.remaining !== null && summary.remaining < 0
              ? "설정된 월 예산을 초과했어요"
              : "총지출을 제외하고 남은 예산이에요",
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-surface-muted pb-20 text-foreground">
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

      <div className="mx-auto w-full max-w-[1680px] px-6 pt-24 md:pt-[60px] xl:px-[120px] xl:pt-[91px]">
        <header className="mx-auto flex w-full max-w-[640px] flex-col items-center">
          <h1 className="text-center text-2xl leading-8 font-semibold text-foreground-strong md:text-[32px] md:leading-[42px]">
            예산 관리
          </h1>
          <BudgetSectionTabs />
        </header>

        <section className="mx-auto mt-10 max-w-[1238px] md:mt-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl leading-8 font-semibold text-foreground-strong md:text-2xl">
                월별 예산 현황
              </h2>
              <p className="mt-1 text-sm leading-6 text-foreground-muted">
                선택한 월의 예산과 승인된 주문 지출을 확인해요.
              </p>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground-strong">
                조회 연월
              </span>
              <input
                type="month"
                value={yearMonth}
                onChange={handleYearMonthChange}
                className="h-12 w-full rounded-lg border border-snack-gray-200 bg-surface px-4 text-base text-foreground-strong outline-none transition-colors focus:border-accent md:w-[190px]"
              />
            </label>
          </div>

          {isPending ? (
            <p className="py-20 text-center text-foreground-muted">
              월별 예산 통계를 불러오는 중…
            </p>
          ) : null}

          {isError ? (
            <p className="py-20 text-center text-snack-state-100">
              {error instanceof Error
                ? error.message
                : "월별 예산 통계를 불러오지 못했습니다."}
            </p>
          ) : null}

          {summary ? (
            <div
              aria-label="월별 예산 요약"
              className="mt-6 grid gap-4 md:grid-cols-3"
            >
              {summaryCards.map((card) => (
                <article
                  key={card.label}
                  className="flex min-h-[156px] flex-col justify-between rounded-2xl border border-border bg-surface p-5 md:min-h-[184px] md:p-6"
                >
                  <div>
                    <h3 className="text-base leading-6 font-bold text-snack-black-200 md:text-xl md:leading-8">
                      {card.label}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-foreground-muted">
                      {card.description}
                    </p>
                  </div>
                  <strong className="mt-6 text-xl leading-8 text-snack-black-200 md:text-[28px] md:leading-10">
                    {card.amount}
                  </strong>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        {summary ? (
          <section className="mx-auto mt-8 max-w-[1238px] rounded-2xl border border-border bg-surface p-5 md:mt-10 md:p-8">
            <div>
              <h2 className="text-xl leading-8 font-semibold text-foreground-strong md:text-2xl">
                카테고리별 지출
              </h2>
              <p className="mt-1 text-sm leading-6 text-foreground-muted">
                대분류별 비중을 표시하며, 항목을 누르면 소분류를 확인할 수
                있어요.
              </p>
            </div>

            {summary.productAmount > 0 && displayCategories.length > 0 ? (
              <div className="mt-8 grid items-center gap-10 md:grid-cols-[minmax(440px,1fr)_minmax(320px,1fr)] md:gap-8 xl:gap-14">
                <DonutChart
                  categories={displayCategories}
                  productAmount={summary.productAmount}
                />

                <div>
                  <ul className="divide-y divide-snack-gray-200">
                    {displayCategories.map((category) => (
                      <li key={category.name} className="py-4 first:pt-0">
                        <details className="group">
                          <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] gap-4 [&::-webkit-details-marker]:hidden">
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className="size-3 shrink-0 rounded-full"
                                style={{ backgroundColor: category.color }}
                                aria-hidden="true"
                              />
                              <span className="truncate text-base font-medium text-foreground-strong">
                                {category.name}
                                <span className="ml-2 text-sm font-normal text-accent group-open:hidden">
                                  상세보기
                                </span>
                                <span className="ml-2 hidden text-sm font-normal text-accent group-open:inline">
                                  접기
                                </span>
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-semibold text-foreground-strong">
                                {formatWon(category.amount)}
                              </p>
                              <p className="text-sm text-foreground-muted">
                                {formatPercentage(category.percentage)}
                              </p>
                            </div>
                          </summary>

                          <ul className="mt-4 space-y-3 rounded-xl bg-surface-muted px-4 py-4">
                            {category.children.length > 0 ? (
                              category.children.map((item) => (
                                <li
                                  key={`${category.name}-${item.name}`}
                                  className="flex items-center justify-between gap-4 text-sm"
                                >
                                  <span className="text-foreground-muted">
                                    {item.name}
                                  </span>
                                  <span className="text-right">
                                    <strong className="font-medium text-foreground-strong">
                                      {formatWon(item.amount)}
                                    </strong>
                                    <span className="ml-2 text-foreground-muted">
                                      {formatPercentage(item.percentage)}
                                    </span>
                                  </span>
                                </li>
                              ))
                            ) : (
                              <li className="text-sm text-foreground-muted">
                                집계된 소분류가 없어요.
                              </li>
                            )}
                          </ul>
                        </details>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-4 text-xs leading-5 text-foreground-muted">
                    기타는 카테고리 정보가 없는 항목을 합산해요.
                  </p>

                  <div className="mt-6 flex items-center justify-between rounded-xl bg-surface-muted px-4 py-4 md:px-5">
                    <div>
                      <p className="font-semibold text-foreground-strong">
                        배송비
                      </p>
                      <p className="mt-1 text-sm text-foreground-muted">
                        카테고리 지출에는 포함되지 않아요.
                      </p>
                    </div>
                    <strong className="ml-4 shrink-0 text-lg text-foreground-strong">
                      {formatWon(summary.shippingFee)}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl bg-surface-muted px-6 py-16 text-center">
                <p className="font-medium text-foreground-strong">
                  선택한 월의 상품 지출이 없어요.
                </p>
                <p className="mt-2 text-sm text-foreground-muted">
                  승인된 주문이 생기면 카테고리별 지출을 확인할 수 있어요.
                </p>
                <div className="mx-auto mt-8 flex max-w-md items-center justify-between rounded-xl bg-surface px-4 py-4">
                  <span className="font-semibold text-foreground-strong">
                    배송비
                  </span>
                  <strong className="text-foreground-strong">
                    {formatWon(summary.shippingFee)}
                  </strong>
                </div>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
