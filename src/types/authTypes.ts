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

export type SuperAdminSignupPayload = {
  name: string;
  email: string;
  password: string;
  companyName: string;
  businessNumber: string;
};

/** 로그인 폼 */

export type LoginForm = {
  email: string;
  password: string;
};

export type LoginErrors = Partial<Record<keyof LoginForm, string>>;

export type LoginPayload = {
  email: string;
  password: string;
};
