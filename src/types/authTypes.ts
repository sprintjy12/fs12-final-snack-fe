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
