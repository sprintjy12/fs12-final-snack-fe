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
  children?: ReactNode;
  className?: string;
};

const BASE_CLASS =
  "h-[54px] w-full rounded-2xl border border-snack-orange-300 px-3.5 text-sm leading-6 outline-none xl:h-16 xl:text-xl xl:leading-8";

/**
 * 주황 보더 텍스트 필드 (입력 / 읽기 전용 박스).
 */
export function TextField({
  readOnlyBox = false,
  children,
  className,
  readOnly,
  ...props
}: TextFieldProps) {
  if (readOnlyBox) {
    return (
      <div
        className={[
          BASE_CLASS,
          "flex items-center bg-surface-muted text-foreground",
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
      className={[
        BASE_CLASS,
        "bg-surface text-foreground placeholder:text-snack-gray-400",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
