/** BE UserRole */
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export type UserStatus = "ACTIVE" | "INACTIVE" | "WITHDRAWN" | string;

/** GET /api/users/me data */
export type MyProfile = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  company: {
    id: string;
    name: string;
  };
};

/**
 * 프로필 변경 폼.
 * Figma: companyName(최고관리자) + password + passwordConfirm
 * BE password API는 currentPassword도 요구 → currentPassword 포함
 */
export type ProfileForm = {
  companyName: string;
  currentPassword: string;
  password: string;
  passwordConfirm: string;
};

export type ProfileFormErrors = Partial<Record<keyof ProfileForm, string>>;

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type ChangeCompanyNamePayload = {
  companyName: string;
};

export type ChangeCompanyNameResult = {
  id: string;
  name: string;
};
