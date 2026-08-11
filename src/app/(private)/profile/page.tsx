"use client";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";

import { Button, Icon, TextField, useToast } from "@/components/ui";
import {
  useChangeCompanyName,
  useChangePassword,
} from "@/hooks/mutations/useUsers";
import { useMyProfile } from "@/hooks/queries/useMyProfile";
import { performClientLogout } from "@/hooks/useClientLogout";
import { clearAccessToken, getAccessToken } from "@/lib/authStorage";
import {
  changeCompanyNameFormSchema,
  profilePasswordFormSchema,
} from "@/schemas/authSchema";
import type {
  ProfileForm,
  ProfileFormErrors,
  UserRole,
} from "@/types/userTypes";

const INITIAL_FORM: ProfileForm = {
  companyName: "",
  currentPassword: "",
  password: "",
  passwordConfirm: "",
};

const ROLE_LABEL: Record<UserRole, string> = {
  USER: "일반",
  ADMIN: "관리자",
  SUPER_ADMIN: "최고 관리자",
};

const getPasswordFormErrors = (
  error: z.ZodError<z.infer<typeof profilePasswordFormSchema>>,
): ProfileFormErrors => {
  const { fieldErrors } = z.flattenError(error);
  const next: ProfileFormErrors = {};

  (
    Object.keys(fieldErrors) as (keyof z.infer<
      typeof profilePasswordFormSchema
    >)[]
  ).forEach((key) => {
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
): ProfileFormErrors => {
  const next: ProfileFormErrors = {};
  const keyMap: Record<string, keyof ProfileForm> = {
    currentPassword: "currentPassword",
    newPassword: "password",
    companyName: "companyName",
    password: "password",
    passwordConfirm: "passwordConfirm",
  };

  for (const [key, value] of Object.entries(fieldErrors)) {
    const formKey = keyMap[key];
    if (!formKey) {
      continue;
    }

    if (Array.isArray(value) && typeof value[0] === "string" && value[0]) {
      next[formKey] = value[0];
      continue;
    }

    if (typeof value === "string" && value) {
      next[formKey] = value;
    }
  }

  return next;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const applyProfileApiError = (
  error: unknown,
): { fieldErrors: ProfileFormErrors; message?: string } => {
  if (!axios.isAxiosError(error)) {
    return {
      fieldErrors: {},
      message:
        error instanceof Error
          ? error.message
          : "프로필 변경에 실패했습니다. 잠시 후 다시 시도해주세요.",
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

  const code = typeof data?.code === "string" ? data.code : "";
  const message =
    typeof data?.message === "string" && data.message.trim()
      ? data.message
      : "프로필 변경에 실패했습니다. 잠시 후 다시 시도해주세요.";

  if (code === "CURRENT_PASSWORD_MISMATCH") {
    return { fieldErrors: { currentPassword: message } };
  }

  if (code === "SAME_AS_CURRENT_PASSWORD") {
    return { fieldErrors: { password: message } };
  }

  if (code === "PASSWORD_CHANGE_CONFLICT") {
    return { fieldErrors: {}, message };
  }

  return { fieldErrors: {}, message };
};

const fieldLabelClassName =
  "text-base leading-[26px] text-foreground-strong xl:text-xl xl:leading-8";

/** 실제 input과 연결되는 라벨 (htmlFor) */
const FieldLabel = ({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: string;
}) => (
  <label htmlFor={htmlFor} className={fieldLabelClassName}>
    {children}
  </label>
);

/**
 * readOnlyBox(div)용 라벨 — form control이 아니므로 htmlFor 대신
 * span id + aria-labelledby로 연결합니다.
 */
const ReadOnlyFieldLabel = ({
  id,
  children,
}: {
  id: string;
  children: string;
}) => (
  <span id={id} className={fieldLabelClassName}>
    {children}
  </span>
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
  autoComplete,
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
  autoComplete?: string;
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
            autoComplete={autoComplete}
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
 * Figma:
 * - 일반 유저 — node 1:12281 (권한 없음, 기업명 읽기 전용)
 * - 관리자 — node 1:12370 (권한: 관리자)
 * - 최고관리자 — node 1:6196 (권한: 최고 관리자, 기업명 수정 가능)
 * API: GET /api/users/me, PATCH /api/users/me/password, PATCH /api/users/me/company
 *
 * 데이터 흐름: Component → TanStack Query Hook → userApi → apiClient → BE
 */
const ProfilePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const {
    data: profile,
    isLoading,
    isError,
    error: profileError,
  } = useMyProfile();
  const changePasswordMutation = useChangePassword();
  const changeCompanyNameMutation = useChangeCompanyName();

  const [form, setForm] = useState<ProfileForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const role = profile?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const showRoleField = role === "ADMIN" || role === "SUPER_ADMIN";

  const passwordTouched =
    form.currentPassword.trim() !== "" ||
    form.password.trim() !== "" ||
    form.passwordConfirm.trim() !== "";
  const passwordAllFilled =
    form.currentPassword.trim() !== "" &&
    form.password.trim() !== "" &&
    form.passwordConfirm.trim() !== "";
  const companyChanged =
    isSuperAdmin &&
    form.companyName.trim() !== "" &&
    form.companyName.trim() !== (profile?.company.name ?? "");
  // handleSubmit과 동일: SUPER_ADMIN은 회사명이 비어 있으면 제출 불가
  const companyNameMissing = isSuperAdmin && form.companyName.trim() === "";

  const isCtaActive =
    Boolean(profile) &&
    !isSubmitting &&
    !companyNameMissing &&
    (companyChanged || passwordAllFilled) &&
    (!passwordTouched || passwordAllFilled);

  useEffect(() => {
    if (!getAccessToken()) {
      showToast("로그인이 필요합니다.");
      router.replace("/login");
    }
  }, [router, showToast]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      ...INITIAL_FORM,
      companyName: profile.company.name,
    });
  }, [profile]);

  useEffect(() => {
    if (!isError || !profileError) {
      return;
    }

    showToast(
      getApiErrorMessage(profileError, "내 정보를 불러오지 못했습니다."),
    );
    if (
      axios.isAxiosError(profileError) &&
      profileError.response?.status === 401
    ) {
      clearAccessToken();
      router.replace("/login");
    }
  }, [isError, profileError, router, showToast]);

  const updateField = (key: keyof ProfileForm) => (value: string) => {
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
    if (isSubmitting || !profile || !isCtaActive) {
      return;
    }

    const nextErrors: ProfileFormErrors = {};
    let parsedPassword: z.infer<typeof profilePasswordFormSchema> | null =
      null;
    let parsedCompanyName: string | null = null;

    // 최고관리자: 회사명이 비어 있으면 비밀번호만 바꿔도 회사명 입력을 요구합니다.
    if (isSuperAdmin && form.companyName.trim() === "") {
      nextErrors.companyName = "회사명을 입력해주세요.";
    }

    if (passwordTouched) {
      const passwordResult = profilePasswordFormSchema.safeParse({
        currentPassword: form.currentPassword,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
      });
      if (!passwordResult.success) {
        Object.assign(nextErrors, getPasswordFormErrors(passwordResult.error));
      } else {
        parsedPassword = passwordResult.data;
      }
    }

    if (companyChanged) {
      const companyResult = changeCompanyNameFormSchema.safeParse({
        companyName: form.companyName,
      });
      if (!companyResult.success) {
        nextErrors.companyName =
          companyResult.error.flatten().fieldErrors.companyName?.[0] ??
          "회사명을 확인해주세요.";
      } else {
        parsedCompanyName = companyResult.data.companyName;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // 회사명→비밀번호 순서면 회사명만 반영된 채 비밀번호가 실패할 수 있어
    // 비밀번호를 먼저 호출합니다. (비밀번호 변경 후에도 access JWT는 만료 전까지 유효)
    let passwordChanged = false;
    let passwordSuccessMessage =
      "비밀번호가 변경되었습니다. 다시 로그인해주세요.";
    let companyErrorAfterPassword: unknown = null;

    try {
      if (parsedPassword) {
        const result = await changePasswordMutation.mutateAsync({
          currentPassword: parsedPassword.currentPassword,
          newPassword: parsedPassword.password,
        });
        passwordChanged = true;
        if (result.message?.trim()) {
          passwordSuccessMessage = result.message;
        }
      }

      if (parsedCompanyName) {
        try {
          const company = await changeCompanyNameMutation.mutateAsync({
            companyName: parsedCompanyName,
          });
          setForm((prev) => ({ ...prev, companyName: company.name }));
          if (!passwordChanged) {
            showToast("회사명이 변경되었습니다.");
          }
        } catch (error) {
          if (passwordChanged) {
            companyErrorAfterPassword = error;
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      const { fieldErrors, message } = applyProfileApiError(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else if (message) {
        showToast(message);
      }
    } finally {
      // 비밀번호 변경 성공 시에는 logout/redirect가 끝날 때까지 submitting 유지
      if (!passwordChanged) {
        setIsSubmitting(false);
      }
    }

    // 비밀번호 변경 성공 후에는 logout API 결과와 무관하게 세션 정리 + 로그인 이동
    if (passwordChanged) {
      await performClientLogout(queryClient);
      showToast(passwordSuccessMessage);
      if (companyErrorAfterPassword) {
        const { message } = applyProfileApiError(companyErrorAfterPassword);
        showToast(
          message ??
            "회사명 변경에 실패했습니다. 다시 로그인한 뒤 시도해주세요.",
        );
      }
      router.replace("/login");
    }
  };

  return (
    <main className="min-h-screen bg-surface-muted text-foreground">
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-start px-4 pt-10 pb-20 xl:gap-20 xl:px-0 xl:pt-[126px] xl:pb-24">
        <h1 className="m-0 w-full text-2xl leading-8 font-semibold text-foreground-strong xl:text-[32px] xl:leading-[42px]">
          내 프로필
        </h1>

        <form
          className="mt-10 flex w-full flex-col items-center gap-10 xl:mt-0 xl:gap-14"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex w-full flex-col gap-6 xl:gap-8">
            <div className="flex w-full flex-col gap-4">
              {isSuperAdmin ? (
                <FieldLabel htmlFor="companyName">기업명</FieldLabel>
              ) : (
                <ReadOnlyFieldLabel id="companyName-label">
                  기업명
                </ReadOnlyFieldLabel>
              )}
              <div className="flex w-full flex-col gap-1">
                {isSuperAdmin ? (
                  <TextField
                    id="companyName"
                    name="companyName"
                    autoComplete="organization"
                    value={form.companyName}
                    error={Boolean(errors.companyName)}
                    disabled={isLoading || isSubmitting}
                    aria-describedby={
                      errors.companyName ? "companyName-error" : undefined
                    }
                    onChange={(event) =>
                      updateField("companyName")(event.target.value)
                    }
                  />
                ) : (
                  <TextField
                    readOnlyBox
                    aria-labelledby="companyName-label"
                    aria-readonly="true"
                  >
                    {isLoading ? "불러오는 중..." : (profile?.company.name ?? "")}
                  </TextField>
                )}
                <FieldError
                  id="companyName-error"
                  message={errors.companyName}
                />
              </div>
            </div>

            {showRoleField ? (
              <div className="flex w-full flex-col gap-4">
                <ReadOnlyFieldLabel id="role-label">권한</ReadOnlyFieldLabel>
                <TextField
                  readOnlyBox
                  aria-labelledby="role-label"
                  aria-readonly="true"
                >
                  {role ? ROLE_LABEL[role] : ""}
                </TextField>
              </div>
            ) : null}

            <div className="flex w-full flex-col gap-4">
              <ReadOnlyFieldLabel id="name-label">이름</ReadOnlyFieldLabel>
              <TextField
                readOnlyBox
                aria-labelledby="name-label"
                aria-readonly="true"
              >
                {isLoading ? "불러오는 중..." : (profile?.name ?? "")}
              </TextField>
            </div>

            <div className="flex w-full flex-col gap-4">
              <ReadOnlyFieldLabel id="email-label">이메일</ReadOnlyFieldLabel>
              <TextField
                readOnlyBox
                aria-labelledby="email-label"
                aria-readonly="true"
              >
                {isLoading ? "불러오는 중..." : (profile?.email ?? "")}
              </TextField>
            </div>

            <PasswordField
              id="currentPassword"
              label="현재 비밀번호"
              placeholder="현재 비밀번호를 입력해주세요."
              value={form.currentPassword}
              visible={showCurrentPassword}
              error={errors.currentPassword}
              disabled={isLoading || isSubmitting || !profile}
              autoComplete="current-password"
              onToggleVisible={() => setShowCurrentPassword((prev) => !prev)}
              onChange={updateField("currentPassword")}
            />

            <PasswordField
              id="password"
              label="비밀번호"
              placeholder="비밀번호를 입력해주세요."
              value={form.password}
              visible={showPassword}
              error={errors.password}
              disabled={isLoading || isSubmitting || !profile}
              autoComplete="new-password"
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
              disabled={isLoading || isSubmitting || !profile}
              autoComplete="new-password"
              onToggleVisible={() => setShowPasswordConfirm((prev) => !prev)}
              onChange={updateField("passwordConfirm")}
            />
          </div>

          <Button
            type="submit"
            variant={isCtaActive ? "primary" : "muted"}
            width="full"
            disabled={!isCtaActive}
            className={
              isCtaActive ? undefined : "bg-snack-gray-200 text-surface"
            }
          >
            {isSubmitting ? "변경 중..." : "변경하기"}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default ProfilePage;
