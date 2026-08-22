"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/budget", label: "예산 설정" },
  { href: "/budget/statistics", label: "월별 통계" },
] as const;

export default function BudgetSectionTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="예산 관리 메뉴"
      className="mt-8 flex w-full border-b border-snack-gray-200 md:mt-10"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex flex-1 items-center justify-center border-b-2 px-3 py-3 text-sm leading-6 font-medium transition-colors md:text-lg md:leading-[26px]",
              isActive
                ? "border-accent font-bold text-accent"
                : "border-transparent text-snack-gray-400 hover:text-foreground-strong",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
