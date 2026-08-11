"use client";

import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";

export type ButtonVariant = "primary" | "secondary" | "muted" | "outline";
export type ButtonSize = "cta" | "compact";
export type ButtonWidth = "auto" | "full" | "modal";

export type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  /** cta: 시안 CTA(54→64). compact: 샘플용 h-14 */
  size?: ButtonSize;
  /**
   * auto: 내용 너비
   * full: 가로 100%
   * modal: 모바일 full + Desktop(xl) 310px (모달 CTA)
   */
  width?: ButtonWidth;
  href?: string;
  className?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-surface",
  secondary: "bg-snack-background-500 text-accent",
  muted: "bg-snack-background-300 text-foreground-muted",
  outline:
    "border border-border bg-surface text-foreground-strong",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  cta: "h-[54px] p-4 text-base leading-[26px] xl:h-16 xl:text-xl xl:leading-8",
  compact: "h-14 px-6 text-base font-semibold leading-none",
};

const WIDTH_CLASS: Record<ButtonWidth, string> = {
  auto: "",
  full: "w-full",
  modal: "w-full xl:w-[310px] xl:max-w-[310px] xl:flex-none",
};

/**
 * 시안 CTA 버튼 (주황 / 크림 / 회색 / 아웃라인).
 * Modal·폼 모달·페이지 CTA에서 같은 토큰을 재사용합니다.
 */
export function Button({
  children,
  variant = "primary",
  size = "cta",
  width = "auto",
  href,
  className,
  type = "button",
  disabled,
  onClick,
}: ButtonProps) {
  const classNames = [
    "inline-flex cursor-pointer items-center justify-center rounded-2xl font-semibold",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    WIDTH_CLASS[width],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classNames}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classNames}
    >
      {children}
    </button>
  );
}
