"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import styles from "./Sidebar.module.css";

export type SidebarNavItem = {
  href: string;
  label: string;
};

export type SidebarProps = {
  title?: string;
  navItems?: SidebarNavItem[];
  footer?: ReactNode;
  className?: string;
};

const DEFAULT_NAV_ITEMS: SidebarNavItem[] = [
  { href: "/admin/purchases", label: "구매 요청 관리" },
  { href: "/admin/users", label: "회원 관리" },
  { href: "/admin/budget", label: "예산 관리" },
];

export function Sidebar({
  title = "관리",
  navItems = DEFAULT_NAV_ITEMS,
  footer,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const sidebarClassName = [styles.sidebar, className].filter(Boolean).join(" ");

  return (
    <aside className={sidebarClassName} aria-label={title}>
      <p className={styles.title}>{title}</p>
      <nav>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[styles.navLink, isActive ? styles.active : null]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </aside>
  );
}
