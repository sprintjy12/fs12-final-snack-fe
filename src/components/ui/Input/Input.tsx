"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import styles from "./Input.module.css";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  size?: InputSize;
  className?: string;
  wrapperClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    size = "md",
    id,
    className,
    wrapperClassName,
    disabled = false,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [
    hint && !error ? hintId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  const inputClassName = [
    styles.input,
    styles[size],
    error ? styles.invalid : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const wrapperClassNames = [styles.wrapper, wrapperClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClassNames}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        disabled={disabled}
        className={inputClassName}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
});
