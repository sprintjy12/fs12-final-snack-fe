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

/** GET /api/budgets/monthly-summary */
export type MonthlyBudgetSubcategory = {
  name: string;
  amount: number;
  /** 배송비를 제외한 상품 구매 총액 기준 비율 */
  percentage: number;
};

export type MonthlyBudgetCategory = {
  name: string;
  amount: number;
  /** 배송비를 제외한 상품 구매 총액 기준 비율 */
  percentage: number;
  children: MonthlyBudgetSubcategory[];
};

export type MonthlyBudgetSummaryData = {
  yearMonth: string;
  budget: number;
  spent: number;
  productAmount: number;
  shippingFee: number;
  /** 무제한 예산이면 null */
  remaining: number | null;
  isUnlimited: boolean;
  categories: MonthlyBudgetCategory[];
};

export type MonthlyBudgetSummaryResponse = {
  success: boolean;
  message: string;
  data: MonthlyBudgetSummaryData;
};

/** GET /api/budgets/settings */
export type BudgetSettingsCurrentMonth = {
  yearMonth: string;
  /** null이면 이번 달 예산을 비우고 기본값 따름 */
  amount: number | null;
};

export type BudgetSettingsData = {
  defaultMonthlyBudget: number;
  currentMonth: BudgetSettingsCurrentMonth;
};

export type BudgetSettingsResponse = {
  success: boolean;
  message: string;
  data: BudgetSettingsData;
};

/** PATCH /api/budgets/settings body — 변경된 필드만 전송 */
export type UpdateBudgetSettingsBody = {
  defaultMonthlyBudget?: number;
  /** null이면 이번 달 예산을 비우고 기본값 따름 */
  monthlyBudget?: number | null;
};
