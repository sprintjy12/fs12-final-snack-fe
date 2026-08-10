"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { z } from "zod";

import { signupInvitedUser, verifyInvitation } from "@/api/authApi";
import { Button, CommonImage, Icon, TextField, useToast } from "@/components/ui";
import { invitedSignupFormSchema } from "@/schemas/authSchema";
import type {
  InvitationVerifyData,
  InvitedSignupErrors,
  InvitedSignupForm,
} from "@/types/authTypes";

const INITIAL_FORM: InvitedSignupForm = {
  password: "",
  passwordConfirm: "",
};

const getInvitedSignupFormErrors = (
  error: z.ZodError<z.infer<typeof invitedSignupFormSchema>>,
): InvitedSignupErrors => {
  const { fieldErrors } = z.flattenError(error);
  const next: InvitedSignupErrors = {};

  (Object.keys(fieldErrors) as (keyof InvitedSignupForm)[]).forEach((key) => {
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
): InvitedSignupErrors => {
  const next: InvitedSignupErrors = {};

  for (const [key, value] of Object.entries(fieldErrors)) {
    if (key !== "password") {
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
 * BE ErrorCodes (INVITATION):
 * - INVITATION_NOT_FOUND / EXPIRED / ALREADY_USED / USER_ALREADY_EXISTS → Toast (+ 필요 시 로그인 이동)
 * @see fs12-final-snack-be/src/constants/errorCodes.ts
 * @see fs12-final-snack-be/src/services/invitationService.ts
 */
const INVITATION_FATAL_CODES = new Set([
  "INVITATION_NOT_FOUND",
  "INVITATION_EXPIRED",
  "INVITATION_ALREADY_USED",
  "INVITATION_USER_ALREADY_EXISTS",
]);

const applyInvitedSignupApiError = (
  error: unknown,
): {
  fieldErrors: InvitedSignupErrors;
  message?: string;
  shouldRedirectToLogin?: boolean;
} => {
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

  if (
    error.response?.status === 400 &&
    data?.errors &&
    typeof data.errors === "object"
  ) {
    const fieldErrors = mapApiFieldErrors(data.errors);
    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors };
    }
  }

  const message =
    typeof data?.message === "string" && data.message.trim()
      ? data.message
      : "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.";

  const code = typeof data?.code === "string" ? data.code : "";
  if (INVITATION_FATAL_CODES.has(code)) {
    return { fieldErrors: {}, message, shouldRedirectToLogin: true };
  }

  return { fieldErrors: {}, message };
};

const getInvitationErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : "초대 정보를 확인할 수 없습니다.";
  }

  const data = error.response?.data as { message?: unknown } | undefined;
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  return "초대 정보를 확인할 수 없습니다.";
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

const PasswordField = ({
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
}) => {
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
};

/**
 * Figma: 회원가입/Desktop — node 1:965
 * typing: 회원가입_typing/Desktop — node 1:990
 * error: 회원가입_error/Desktop — node 1:1040
 * API: GET /api/invitations/verify, POST /api/invitations/signup
 */
const InvitedSignupPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const token = searchParams.get("token")?.trim() ?? "";

  const [invitation, setInvitation] = useState<InvitationVerifyData | null>(
    null,
  );
  const [isVerifying, setIsVerifying] = useState(true);
  const [form, setForm] = useState<InvitedSignupForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<InvitedSignupErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const allFilled = Object.values(form).every((value) => value.trim() !== "");
  const isCtaActive = Boolean(invitation) && allFilled && !isSubmitting;
  const formDisabled = isVerifying || !invitation || isSubmitting;

  useEffect(() => {
    let cancelled = false;

    const loadInvitation = async () => {
      if (!token) {
        setIsVerifying(false);
        showToast("초대 링크가 올바르지 않습니다.");
        router.replace("/login");
        return;
      }

      setInvitation(null);
      setIsVerifying(true);

      try {
        const data = await verifyInvitation(token);
        if (!cancelled) {
          setInvitation(data);
        }
      } catch (error) {
        if (!cancelled) {
          showToast(getInvitationErrorMessage(error));
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setIsVerifying(false);
        }
      }
    };

    void loadInvitation();

    return () => {
      cancelled = true;
    };
  }, [token, router, showToast]);

  const updateField = (key: keyof InvitedSignupForm) => (value: string) => {
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
    if (isSubmitting || !invitation || !token) {
      return;
    }

    const parsed = invitedSignupFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(getInvitedSignupFormErrors(parsed.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await signupInvitedUser({
        token,
        password: parsed.data.password,
      });
      showToast("회원가입이 완료되었습니다.");
      router.push("/login");
      // 성공 시 isSubmitting 유지 — 라우팅 전 중복 submit 방지
    } catch (error) {
      const { fieldErrors, message, shouldRedirectToLogin } =
        applyInvitedSignupApiError(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else if (message) {
        showToast(message);
        if (shouldRedirectToLogin) {
          router.replace("/login");
        }
      }
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

      <div className="mx-auto flex w-full max-w-[640px] flex-col items-start gap-10 px-4 py-10 xl:gap-20 xl:py-16">
        <div className="flex w-full flex-col gap-2">
          <h1 className="m-0 text-center text-2xl leading-8 font-semibold text-foreground-strong xl:text-[32px] xl:leading-[42px]">
            {invitation
              ? `안녕하세요, ${invitation.name}님!`
              : "안녕하세요!"}
          </h1>
          <p className="m-0 text-center text-base leading-6 font-medium text-foreground-muted xl:text-2xl xl:leading-8">
            비밀번호를 입력해 회원가입을 완료해주세요.
          </p>
        </div>

        <form
          className="flex w-full flex-col items-center gap-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex w-full flex-col gap-14">
            <div className="flex w-full flex-col gap-6 xl:gap-8">
              <div className="flex w-full flex-col gap-4">
                <FieldLabel htmlFor="email">이메일</FieldLabel>
                <TextField
                  id="email"
                  readOnlyBox
                  aria-readonly="true"
                >
                  {isVerifying
                    ? "초대 정보 확인 중..."
                    : (invitation?.email ?? "")}
                </TextField>
              </div>

              <PasswordField
                id="password"
                label="비밀번호"
                placeholder="비밀번호를 입력해주세요."
                value={form.password}
                visible={showPassword}
                error={errors.password}
                disabled={formDisabled}
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
                disabled={formDisabled}
                onToggleVisible={() =>
                  setShowPasswordConfirm((prev) => !prev)
                }
                onChange={updateField("passwordConfirm")}
              />
            </div>

            <Button
              type="submit"
              variant={isCtaActive ? "primary" : "muted"}
              width="full"
              disabled={isSubmitting || !invitation}
              className={
                isCtaActive ? undefined : "bg-snack-gray-200 text-surface"
              }
            >
              {isSubmitting ? "가입 중..." : "시작하기"}
            </Button>
          </div>

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
        </form>
      </div>
    </main>
  );
};

const SignupPage = () => (
  <Suspense
    fallback={
      <main className="min-h-screen bg-surface-muted">
        <header className="flex h-[54px] items-center justify-center bg-accent xl:h-[88px]">
          <CommonImage
            name="logo-text-white"
            size="md"
            label="Snack"
            className="h-6 w-auto xl:h-8"
          />
        </header>
      </main>
    }
  >
    <InvitedSignupPageContent />
  </Suspense>
);

export default SignupPage;
