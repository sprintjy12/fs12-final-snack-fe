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

/** 초대 회원가입 폼 */

export type InvitedSignupForm = {
  password: string;
  passwordConfirm: string;
};

export type InvitedSignupErrors = Partial<
  Record<keyof InvitedSignupForm, string>
>;

export type InvitedSignupPayload = {
  token: string;
  password: string;
};

export type InvitationVerifyData = {
  name: string;
  email: string;
  role: string;
  companyName: string;
  expiresAt: string;
};

/** BE InvitationRole — USER | ADMIN */
export type InvitationApiRole = "USER" | "ADMIN";

export type CreateInvitationPayload = {
  name: string;
  email: string;
  role: InvitationApiRole;
};

export type CreateInvitationResult = {
  id: number;
  name: string;
  email: string;
  role: InvitationApiRole;
  expiresAt: string;
};
