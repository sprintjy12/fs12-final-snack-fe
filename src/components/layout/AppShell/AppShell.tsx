import type { ReactNode } from "react";

import { Header, type HeaderProps } from "@/components/layout/Header/Header";
import { Sidebar, type SidebarProps } from "@/components/layout/Sidebar/Sidebar";

import styles from "./AppShell.module.css";

export type AppShellProps = {
  children: ReactNode;
  headerProps?: Omit<HeaderProps, "children">;
  sidebarProps?: SidebarProps;
  showSidebar?: boolean;
};

export function AppShell({
  children,
  headerProps,
  sidebarProps,
  showSidebar = true,
}: AppShellProps) {
  return (
    <div className={styles.shell}>
      <Header {...headerProps} />
      <div className={styles.body}>
        {showSidebar ? <Sidebar {...sidebarProps} /> : null}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
