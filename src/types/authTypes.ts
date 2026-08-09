/** 기업 담당자 회원가입 폼 */

export type AdminSignupForm = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  companyName: string;
  businessNumber: string;
};

export type AdminSignupErrors = Partial<
  Record<keyof AdminSignupForm, string>
>;

/** API로 보내는 필드 (passwordConfirm 제외) */
export type AdminSignupApiField = Exclude<
  keyof AdminSignupForm,
  "passwordConfirm"
>;

export type SuperAdminSignupPayload = {
  name: string;
  email: string;
  password: string;
  companyName: string;
  businessNumber: string;
};
