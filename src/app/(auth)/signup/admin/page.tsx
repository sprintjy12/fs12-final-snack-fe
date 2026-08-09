"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { signupSuperAdmin } from "@/api/authApi";
import { Button, CommonImage, Icon, TextField, useToast } from "@/components/ui";
import type {
  AdminSignupApiField,
  AdminSignupErrors,
  AdminSignupForm,
} from "@/types/authTypes";

const INITIAL_FORM: AdminSignupForm = {
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  companyName: "",
  businessNumber: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 20;
const ALLOWED_PASSWORD_CHARACTERS =
  /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/;
const PASSWORD_SPECIAL_CHARACTER =
  /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

const SIGNUP_FIELD_KEYS: readonly AdminSignupApiField[] = [
  "name",
  "email",
  "password",
  "companyName",
  "businessNumber",
];

function isSignupApiField(key: string): key is AdminSignupApiField {
  return (SIGNUP_FIELD_KEYS as readonly string[]).includes(key);
}

/** 하이픈·공백 제거 후 숫자만 남깁니다. */
function normalizeBusinessNumber(value: string) {
  return value.replace(/\D/g, "");
}

/** Figma 회원가입_error + BE superAdminSignupSchema */
function validateAdminSignupForm(form: AdminSignupForm): AdminSignupErrors {
  const errors: AdminSignupErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const companyName = form.companyName.trim();
  const businessNumber = normalizeBusinessNumber(form.businessNumber);

  if (!name) {
    errors.name = "이름을 입력해주세요.";
  } else if (name.length > 8) {
    errors.name = "이름은 8자 이하로 입력해주세요.";
  }

  if (!email) {
    errors.email = "이메일을 입력해주세요.";
  } else if (email.length > 254) {
    errors.email = "이메일은 254자 이하로 입력해주세요.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  if (!form.password) {
    errors.password = "비밀번호를 입력해주세요.";
  } else if (form.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`;
  } else if (form.password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `비밀번호는 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.`;
  } else if (!ALLOWED_PASSWORD_CHARACTERS.test(form.password)) {
    errors.password = "비밀번호는 영문, 숫자, 특수문자만 사용할 수 있습니다.";
  } else if (!/[A-Za-z]/.test(form.password)) {
    errors.password = "비밀번호에 영문을 1자 이상 포함해주세요.";
  } else if (!/[0-9]/.test(form.password)) {
    errors.password = "비밀번호에 숫자를 1자 이상 포함해주세요.";
  } else if (!PASSWORD_SPECIAL_CHARACTER.test(form.password)) {
    errors.password = "비밀번호에 특수문자를 1자 이상 포함해주세요.";
  }

  if (!form.passwordConfirm) {
    errors.passwordConfirm = "비밀번호를 입력해주세요.";
  } else if (form.password && form.password !== form.passwordConfirm) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
  }

  if (!companyName) {
    errors.companyName = "회사명을 입력해주세요.";
  } else if (companyName.length > 15) {
    errors.companyName = "회사명은 15자 이하로 입력해주세요.";
  }

  if (!businessNumber) {
    errors.businessNumber = "사업자등록번호를 입력해주세요.";
  } else if (!/^\d{10}$/.test(businessNumber)) {
    errors.businessNumber =
      "사업자등록번호는 하이픈 없이 숫자 10자리로 입력해주세요.";
  }

  return errors;
}

function mapValidationErrors(
  fieldErrors: Record<string, unknown>,
): AdminSignupErrors {
  const next: AdminSignupErrors = {};

  for (const [key, value] of Object.entries(fieldErrors)) {
    if (!isSignupApiField(key)) {
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
}

function applySignupApiError(error: unknown): {
  fieldErrors: AdminSignupErrors;
  message?: string;
} {
  if (!axios.isAxiosError(error)) {
    return {
      fieldErrors: {},
      message:
        error instanceof Error
          ? error.message
          : "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.",
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
      : "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.";

  if (error.response?.status === 400 && data?.errors) {
    const fieldErrors = mapValidationErrors(data.errors);
    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors, message };
    }
  }

  if (error.response?.status === 409) {
    if (data?.code === "AUTH_DUPLICATE_EMAIL") {
      return { fieldErrors: { email: message } };
    }
    if (data?.code === "COMPANY_DUPLICATE_BUSINESS_NUMBER") {
      return { fieldErrors: { businessNumber: message } };
    }
  }

  return { fieldErrors: {}, message };
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-base leading-[26px] text-foreground-strong xl:text-xl xl:leading-8"
    >
      {children}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
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
}

function PasswordField({
  id,
  label,
  placeholder,
  value,
  visible,
  error,
  disabled,
  onToggleVisible,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  visible: boolean;
  error?: string;
  disabled?: boolean;
  onToggleVisible: () => void;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;

  return (
    <div className="flex w-full flex-col gap-4">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex w-full flex-col gap-1">
        <div className="relative w-full">
          <TextField
            id={id}
            type={visible ? "text" : "password"}
            name={id}
            autoComplete="new-password"
            placeholder={placeholder}
            value={value}
            error={Boolean(error)}
            disabled={disabled}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => onChange(event.target.value)}
            className="pr-12"
          />
          <button
            type="button"
            onClick={onToggleVisible}
            disabled={disabled}
            aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
            className="absolute top-1/2 right-3.5 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center text-snack-gray-400 disabled:cursor-not-allowed"
          >
            <Icon name="visibility" size="sm" active={visible} />
          </button>
        </div>
        <FieldError id={errorId} message={error} />
      </div>
    </div>
  );
}

/**
 * Figma: 회원가입/Desktop (기업 담당자) — node 1:1316
 * 에러 반응: 회원가입_error/Desktop — node 1:1421
 * API: POST /api/auth/super-admin/signup
 */
export default function AdminSignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<AdminSignupForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<AdminSignupErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const allFilled = Object.values(form).every((value) => value.trim() !== "");
  const isCtaActive = (allFilled || submitted) && !isSubmitting;

  const updateField = (key: keyof AdminSignupForm) => (value: string) => {
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

    setSubmitted(true);

    const nextErrors = validateAdminSignupForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signupSuperAdmin({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        companyName: form.companyName.trim(),
        businessNumber: normalizeBusinessNumber(form.businessNumber),
      });

      showToast("회원가입이 완료되었습니다. 로그인해 주세요.");
      router.push("/login");
    } catch (error) {
      const { fieldErrors, message } = applySignupApiError(error);
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
        <div className="flex w-full flex-col gap-2 text-center">
          <h1 className="m-0 text-2xl leading-8 font-semibold text-foreground-strong xl:text-[32px] xl:leading-[42px]">
            기업 담당자 회원가입
          </h1>
          <p className="m-0 text-sm leading-6 text-foreground-muted xl:text-xl xl:leading-8">
            * 그룹 내 유저는 기업 담당자의 초대 메일을 통해 가입이 가능합니다.
          </p>
        </div>

        <form
          className="flex w-full flex-col gap-6 xl:gap-14"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex w-full flex-col gap-6">
            <div className="flex w-full flex-col gap-4">
              <FieldLabel htmlFor="name">이름(기업 담당자)</FieldLabel>
              <div className="flex w-full flex-col gap-1">
                <TextField
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="이름을 입력해주세요."
                  value={form.name}
                  error={Boolean(errors.name)}
                  disabled={isSubmitting}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  onChange={(event) => updateField("name")(event.target.value)}
                />
                <FieldError id="name-error" message={errors.name} />
              </div>
            </div>

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

            <PasswordField
              id="password"
              label="비밀번호"
              placeholder="비밀번호를 입력해주세요."
              value={form.password}
              visible={showPassword}
              error={errors.password}
              disabled={isSubmitting}
              onToggleVisible={() => setShowPassword((prev) => !prev)}
              onChange={updateField("password")}
            />

            <PasswordField
              id="passwordConfirm"
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 한 번 입력해주세요."
              value={form.passwordConfirm}
              visible={showPasswordConfirm}
              error={errors.passwordConfirm}
              disabled={isSubmitting}
              onToggleVisible={() => setShowPasswordConfirm((prev) => !prev)}
              onChange={updateField("passwordConfirm")}
            />

            <div className="flex w-full flex-col gap-4">
              <FieldLabel htmlFor="companyName">회사명</FieldLabel>
              <div className="flex w-full flex-col gap-1">
                <TextField
                  id="companyName"
                  name="companyName"
                  autoComplete="organization"
                  placeholder="회사명을 입력해주세요."
                  value={form.companyName}
                  error={Boolean(errors.companyName)}
                  disabled={isSubmitting}
                  aria-describedby={
                    errors.companyName ? "companyName-error" : undefined
                  }
                  onChange={(event) =>
                    updateField("companyName")(event.target.value)
                  }
                />
                <FieldError
                  id="companyName-error"
                  message={errors.companyName}
                />
              </div>
            </div>

            <div className="flex w-full flex-col gap-4">
              <FieldLabel htmlFor="businessNumber">사업자 번호</FieldLabel>
              <div className="flex w-full flex-col gap-1">
                <TextField
                  id="businessNumber"
                  name="businessNumber"
                  inputMode="numeric"
                  placeholder="사업자 번호를 입력해주세요."
                  value={form.businessNumber}
                  error={Boolean(errors.businessNumber)}
                  disabled={isSubmitting}
                  aria-describedby={
                    errors.businessNumber ? "businessNumber-error" : undefined
                  }
                  onChange={(event) =>
                    updateField("businessNumber")(event.target.value)
                  }
                />
                <FieldError
                  id="businessNumber-error"
                  message={errors.businessNumber}
                />
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
                isCtaActive
                  ? undefined
                  : "bg-snack-gray-200 text-surface"
              }
            >
              {isSubmitting ? "가입 중..." : "시작하기"}
            </Button>

            <p className="m-0 flex flex-wrap items-center justify-center gap-2 text-sm leading-6 xl:text-xl xl:leading-8">
              <span className="text-foreground-muted">
                이미 계정이 있으신가요?
              </span>
              <Link
                href="/login"
                className="font-semibold text-accent underline underline-offset-2"
              >
                로그인
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
