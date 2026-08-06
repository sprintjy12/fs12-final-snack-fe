/** GET /api/budgets/summary */

export type BudgetMonthSummary = {
  yearMonth: string;
  budget: number;
  spent: number;
  remaining: number;
};

export type BudgetYearSummary = {
  year: number;
  spent: number;
};

export type BudgetSummaryData = {
  currentMonth: BudgetMonthSummary;
  previousMonth: BudgetMonthSummary;
  remainingDiffFromPreviousMonth: number;
  currentYear: BudgetYearSummary;
  previousYear: BudgetYearSummary;
  spentDiffFromPreviousYear: number;
};

export type BudgetSummaryResponse = {
  success: boolean;
  message: string;
  data: BudgetSummaryData;
};
