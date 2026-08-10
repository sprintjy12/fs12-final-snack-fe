import type { InputHTMLAttributes, ReactNode } from "react";

export type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  /**
   * true면 읽기 전용 박스(bg-surface-muted).
   * value 대신 children으로도 표시할 수 있습니다.
   */
  readOnlyBox?: boolean;
  /** true면 에러 보더(border-danger). */
  error?: boolean;
  children?: ReactNode;
  className?: string;
};

const BASE_CLASS =
  "h-[54px] w-full rounded-2xl px-3.5 text-sm leading-6 outline-none xl:h-16 xl:text-xl xl:leading-8";

/**
 * 주황 보더 텍스트 필드 (입력 / 읽기 전용 박스).
 */
export function TextField({
  readOnlyBox = false,
  error = false,
  children,
  className,
  readOnly,
  ...props
}: TextFieldProps) {
  const borderClass = error
    ? "border border-danger"
    : "border border-snack-orange-300 focus:border-accent";

  if (readOnlyBox) {
    return (
      <div
        id={props.id}
        role={props.role}
        aria-labelledby={props["aria-labelledby"]}
        aria-label={props["aria-label"]}
        aria-readonly={props["aria-readonly"]}
        aria-describedby={props["aria-describedby"]}
        className={[
          BASE_CLASS,
          error ? "border border-danger" : "border border-border",
          "flex items-center bg-surface-muted text-foreground-muted",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children ?? props.value}
      </div>
    );
  }

  return (
    <input
      {...props}
      readOnly={readOnly}
      aria-invalid={error || props["aria-invalid"]}
      className={[
        BASE_CLASS,
        borderClass,
        "bg-surface text-foreground placeholder:text-snack-gray-400",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
