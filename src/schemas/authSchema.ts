import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 20;
/** 영문·숫자·허용 특수문자만 허용 (한글/공백/이모지 불가). `-`는 문자클래스 끝에 둡니다. */
const ALLOWED_PASSWORD_CHARACTERS =
  /^[A-Za-z0-9!@#$%^&*()_+=[\]{};':"\\|,.<>/?`~-]+$/;
const PASSWORD_SPECIAL_CHARACTER =
  /[!@#$%^&*()_+=[\]{};':"\\|,.<>/?`~-]/;

/** 하이픈·공백 제거 후 숫자만 남깁니다. */
export const normalizeBusinessNumber = (value: string) =>
  value.replace(/\D/g, "");

/**
 * 기업 담당자(최고 관리자) 회원가입 폼 스키마.
 * email은 검증 후 소문자로 변환됩니다.
 */
export const adminSignupFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "이름을 입력해주세요.")
      .max(8, "이름은 8자 이하로 입력해주세요."),
    email: z
      .string()
      .trim()
      .min(1, "이메일을 입력해주세요.")
      .max(254, "이메일은 254자 이하로 입력해주세요.")
      .email("올바른 이메일 형식이 아닙니다.")
      .transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(1, "비밀번호를 입력해주세요.")
      .min(
        PASSWORD_MIN_LENGTH,
        `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
      )
      .max(
        PASSWORD_MAX_LENGTH,
        `비밀번호는 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.`,
      )
      .regex(
        ALLOWED_PASSWORD_CHARACTERS,
        "비밀번호는 영문, 숫자, 특수문자만 사용할 수 있습니다.",
      )
      .regex(/[A-Za-z]/, "비밀번호에 영문을 1자 이상 포함해주세요.")
      .regex(/[0-9]/, "비밀번호에 숫자를 1자 이상 포함해주세요.")
      .regex(
        PASSWORD_SPECIAL_CHARACTER,
        "비밀번호에 특수문자를 1자 이상 포함해주세요.",
      ),
      passwordConfirm: z
      .string()
      .min(1, "비밀번호 확인을 입력해주세요."),
    companyName: z
      .string()
      .trim()
      .min(1, "회사명을 입력해주세요.")
      .max(15, "회사명은 15자 이하로 입력해주세요."),
    businessNumber: z
      .string()
      .transform(normalizeBusinessNumber)
      .pipe(
        z
          .string()
          .min(1, "사업자등록번호를 입력해주세요.")
          .regex(
            /^\d{10}$/,
            "사업자등록번호는 하이픈 없이 숫자 10자리로 입력해주세요.",
          ),
      ),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

export type AdminSignupFormSchemaInput = z.input<
  typeof adminSignupFormSchema
>;
export type AdminSignupFormSchemaOutput = z.output<
  typeof adminSignupFormSchema
>;

/**
 * 로그인 폼 스키마 (BE loginSchema와 맞춤).
 * email은 검증 후 소문자로 변환됩니다.
 */
export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "이메일을 입력해주세요.")
    .max(254, "이메일은 254자 이하로 입력해주세요.")
    .email("올바른 이메일 형식이 아닙니다.")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요.")
    .max(
      PASSWORD_MAX_LENGTH,
      `비밀번호는 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.`,
    ),
});

export type LoginFormSchemaInput = z.input<typeof loginFormSchema>;
export type LoginFormSchemaOutput = z.output<typeof loginFormSchema>;
