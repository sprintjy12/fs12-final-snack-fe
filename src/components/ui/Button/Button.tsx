import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./Button.module.css";

/** Figma: Button/outlined/CTA — primary=주황 outlined, secondary=회색 outlined */
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Figma CTA 풀폭(예: 640px 프레임) — 부모 너비에 맞춤 */
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  disabled = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      disabled={disabled}
      className={classNames}
      {...rest}
    >
      {children}
    </button>
  );
}
