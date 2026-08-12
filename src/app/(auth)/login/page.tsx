"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";

import { login } from "@/api/authApi";
import { Button, CommonImage, Icon, TextField, useToast } from "@/components/ui";
import { loginFormSchema } from "@/schemas/authSchema";
import type { LoginErrors, LoginForm } from "@/types/authTypes";

const INITIAL_FORM: LoginForm = {
  email: "",
  password: "",
};

const getLoginFormErrors = (
  error: z.ZodError<z.infer<typeof loginFormSchema>>,
): LoginErrors => {
  const { fieldErrors } = z.flattenError(error);
  const next: LoginErrors = {};

  (Object.keys(fieldErrors) as (keyof LoginForm)[]).forEach((key) => {
    const message = fieldErrors[key]?.[0];
    if (message) {
      next[key] = message;
    }
  });

  return next;
};

/**
 * BE zodValidate는 400 시 fieldErrors를 `errors`로 반환합니다.
 * @see fs12-final-snack-be/src/middlewares/zodValidate.ts
 */
const mapApiFieldErrors = (
  fieldErrors: Record<string, unknown>,
): LoginErrors => {
  const next: LoginErrors = {};

  for (const [key, value] of Object.entries(fieldErrors)) {
    if (key !== "email" && key !== "password") {
      continue;
    }

    if (Array.isArray(value) && typeof value[0] === "string" && value[0]) {
      next[key] = value[0];
      continue;
    }

    if (typeof value === "string" && value) {
      next[key] = value;
    }
  }

  return next;
};

/**
 * BE ErrorCodes:
 * - AUTH_INVALID_CREDENTIALS (401) → password 필드
 * - AUTH_INACTIVE_USER (401) → Toast
 * @see fs12-final-snack-be/src/constants/errorCodes.ts
 * @see fs12-final-snack-be/src/services/authService.ts
 */
const applyLoginApiError = (
  error: unknown,
): {
  fieldErrors: LoginErrors;
  message?: string;
} => {
  if (!axios.isAxiosError(error)) {
    return {
      fieldErrors: {},
      message:
        error instanceof Error
          ? error.message
          : "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
    };
  }

  const data = error.response?.data as
    | {
        message?: unknown;
        code?: unknown;
        errors?: Record<string, unknown>;
      }
    | undefined;

  const message =
    typeof data?.message === "string" && data.message.trim()
      ? data.message
      : "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.";

  if (error.response?.status === 400 && data?.errors) {
    const fieldErrors = mapApiFieldErrors(data.errors);
    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors, message };
    }
  }

  if (error.response?.status === 401) {
    if (data?.code === "AUTH_INVALID_CREDENTIALS") {
      return { fieldErrors: { password: message } };
    }

    // AUTH_INACTIVE_USER 등 → Toast
    return { fieldErrors: {}, message };
  }

  return { fieldErrors: {}, message };
};

const FieldLabel = ({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: string;
}) => (
  <label
    htmlFor={htmlFor}
    className="text-base leading-[26px] text-foreground-strong xl:text-xl xl:leading-8"
  >
    {children}
  </label>
);

const FieldError = ({ id, message }: { id: string; message?: string }) => {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="pl-2 text-sm leading-[26px] font-medium text-danger"
    >
      {message}
    </p>
  );
};

/**
 * Figma:
 * - gnb — 1:2474
 * - 로그인_typing — 1:2492
 * - 로그인_done — 1:2511
 * - 로그인_error — 1:2530
 * API: POST /api/auth/login
 */
const LoginPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<LoginForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const allFilled = Object.values(form).every((value) => value.trim() !== "");
  const isCtaActive = allFilled && !isSubmitting;

  const updateField = (key: keyof LoginForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const parsed = loginFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(getLoginFormErrors(parsed.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await login(parsed.data);
      showToast("로그인되었습니다.");
      router.push("/products");
    } catch (error) {
      const { fieldErrors, message } = applyLoginApiError(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else if (message) {
        showToast(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface-muted">
      <header className="flex h-[54px] items-center justify-center bg-accent xl:h-[88px]">
        <Link href="/" aria-label="Snack 홈" className="inline-flex">
          <CommonImage
            name="logo-text-white"
            size="md"
            label="Snack"
            className="h-6 w-auto xl:h-8"
          />
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-10 px-4 py-10 xl:gap-16 xl:py-16">
        <h1 className="m-0 text-center text-2xl leading-8 font-semibold text-foreground-strong xl:text-[32px] xl:leading-[42px]">
          로그인
        </h1>

        <form
          className="flex w-full flex-col gap-6 xl:gap-14"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex w-full flex-col gap-6 xl:gap-8">
            <div className="flex w-full flex-col gap-4">
              <FieldLabel htmlFor="email">이메일</FieldLabel>
              <div className="flex w-full flex-col gap-1">
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="이메일을 입력해주세요."
                  value={form.email}
                  error={Boolean(errors.email)}
                  disabled={isSubmitting}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  onChange={(event) => updateField("email")(event.target.value)}
                />
                <FieldError id="email-error" message={errors.email} />
              </div>
            </div>

            <div className="flex w-full flex-col gap-4">
              <FieldLabel htmlFor="password">비밀번호</FieldLabel>
              <div className="flex w-full flex-col gap-1">
                <div className="relative w-full">
                  <TextField
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="비밀번호를 입력해주세요."
                    value={form.password}
                    error={Boolean(errors.password)}
                    disabled={isSubmitting}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    onChange={(event) =>
                      updateField("password")(event.target.value)
                    }
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isSubmitting}
                    aria-label={
                      showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                    }
                    className="absolute top-1/2 right-3.5 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center text-snack-gray-400 disabled:cursor-not-allowed"
                  >
                    <Icon name="visibility" size="sm" active={showPassword} />
                  </button>
                </div>
                <FieldError id="password-error" message={errors.password} />
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-6">
            <Button
              type="submit"
              variant={isCtaActive ? "primary" : "muted"}
              width="full"
              disabled={isSubmitting}
              className={
                isCtaActive ? undefined : "bg-snack-gray-200 text-surface"
              }
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
            </Button>

            <p className="m-0 flex flex-wrap items-center justify-center gap-2 text-sm leading-6 xl:text-xl xl:leading-8">
              <span className="text-foreground-muted">
                기업 담당자이신가요?
              </span>
              <Link
                href="/signup/admin"
                className="font-semibold text-accent underline underline-offset-2"
              >
                가입하기
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
};

export default LoginPage;
