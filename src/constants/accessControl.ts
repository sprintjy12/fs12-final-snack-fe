import type { UserRole } from "@/types/userTypes";

/** Header / MobileSidebar와 공유하는 GNB 항목 */
export type AppNavItem = {
  href: string;
  label: string;
};

/** USER < ADMIN < SUPER_ADMIN */
const ROLE_RANK: Record<UserRole, number> = {
  USER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

const USER_UP = ["USER", "ADMIN", "SUPER_ADMIN"] as const satisfies readonly UserRole[];
const ADMIN_UP = ["ADMIN", "SUPER_ADMIN"] as const satisfies readonly UserRole[];
const SUPER_ADMIN_ONLY = ["SUPER_ADMIN"] as const satisfies readonly UserRole[];

type PathAccessRule = {
  /** pathname이 이 규칙에 해당하는지 (동적 세그먼트 포함) */
  match: (pathname: string) => boolean;
  allowedRoles: readonly UserRole[];
};

/**
 * 보호 경로별 최소 권한.
 * 더 구체적인 prefix를 위에 두되, match는 상호 배타적으로 작성합니다.
 * 상세/complete 등은 부모 prefix 권한을 상속합니다.
 */
const PATH_ACCESS_RULES: readonly PathAccessRule[] = [
  {
    match: (pathname) =>
      pathname === "/admin" || pathname.startsWith("/admin/"),
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    match: (pathname) =>
      pathname === "/budget" || pathname.startsWith("/budget/"),
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    match: (pathname) =>
      pathname === "/purchase/requests" ||
      pathname.startsWith("/purchase/requests/"),
    allowedRoles: ADMIN_UP,
  },
  {
    match: (pathname) =>
      pathname === "/purchase/history" ||
      pathname.startsWith("/purchase/history/"),
    allowedRoles: ADMIN_UP,
  },
  {
    match: (pathname) =>
      pathname === "/purchase/my-requests" ||
      pathname.startsWith("/purchase/my-requests/"),
    allowedRoles: USER_UP,
  },
  {
    // legacy → /purchase/requests/complete. 목적지와 동일하게 ADMIN+
    match: (pathname) =>
      pathname === "/purchase-requests" ||
      pathname.startsWith("/purchase-requests/"),
    allowedRoles: ADMIN_UP,
  },
  {
    match: (pathname) =>
      pathname === "/products" || pathname.startsWith("/products/"),
    allowedRoles: USER_UP,
  },
  {
    match: (pathname) =>
      pathname === "/cart" || pathname.startsWith("/cart/"),
    allowedRoles: USER_UP,
  },
  {
    match: (pathname) =>
      pathname === "/profile" || pathname.startsWith("/profile/"),
    allowedRoles: USER_UP,
  },
];

type NavItemPolicy = AppNavItem & {
  minRole: UserRole;
};

/**
 * GNB 전체 후보.
 * "예산 관리"는 별도 메뉴로 두지 않고, SUPER_ADMIN 전용 "관리"(/admin)만 둡니다.
 * /budget active는 Header의 기존 isNavItemActive(/admin) 규칙을 유지합니다.
 */
const NAV_ITEM_POLICIES = [
  { href: "/products", label: "상품 리스트", minRole: "USER" },
  { href: "/purchase/my-requests", label: "구매 요청 내역", minRole: "USER" },
  { href: "/purchase/requests", label: "구매 요청 관리", minRole: "ADMIN" },
  { href: "/purchase/history", label: "구매 내역 확인", minRole: "ADMIN" },
  { href: "/products/mine", label: "상품 등록 내역", minRole: "USER" },
  { href: "/admin", label: "관리", minRole: "SUPER_ADMIN" },
] as const satisfies readonly NavItemPolicy[];

const hasMinRole = (role: UserRole, minRole: UserRole) =>
  ROLE_RANK[role] >= ROLE_RANK[minRole];

/** 인증·샘플·redirect 전용 등 Guard 제외 경로 */
export const isGuardExemptPath = (pathname: string) => {
  if (pathname === "/") {
    return true;
  }

  if (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/signup/") ||
    pathname === "/invite" ||
    pathname.startsWith("/invite/")
  ) {
    return true;
  }

  if (
    pathname === "/modal-sample" ||
    pathname.startsWith("/modal-sample/") ||
    pathname === "/toast-sample" ||
    pathname.startsWith("/toast-sample/") ||
    pathname === "/posts-sample" ||
    pathname.startsWith("/posts-sample/") ||
    pathname === "/upload-test" ||
    pathname.startsWith("/upload-test/")
  ) {
    return true;
  }

  return false;
};

/** AppHeader를 숨기는 경로 (표지·인증·일부 샘플) */
export const shouldHideAppHeader = (pathname: string) => {
  if (pathname === "/") {
    return true;
  }

  if (
    pathname.startsWith("/signup") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/invite")
  ) {
    return true;
  }

  if (pathname === "/modal-sample" || pathname === "/toast-sample") {
    return true;
  }

  return false;
};

export const findAccessRule = (pathname: string) =>
  PATH_ACCESS_RULES.find((rule) => rule.match(pathname));

/** 로그인·권한이 필요한 앱 경로인지 */
export const isProtectedPath = (pathname: string) => {
  if (isGuardExemptPath(pathname)) {
    return false;
  }

  return Boolean(findAccessRule(pathname));
};

export const canAccessPath = (
  pathname: string,
  role: UserRole | null | undefined,
) => {
  if (!role) {
    return false;
  }

  const rule = findAccessRule(pathname);
  if (!rule) {
    return true;
  }

  return rule.allowedRoles.includes(role);
};

export const getNavItemsForRole = (
  role: UserRole | null | undefined,
): AppNavItem[] => {
  if (!role) {
    return [];
  }

  return NAV_ITEM_POLICIES.filter((item) =>
    hasMinRole(role, item.minRole),
  ).map(({ href, label }) => ({ href, label }));
};

/** SUPER_ADMIN 기준 전체 메뉴 (Header 기본값·테스트용) */
export const ALL_NAV_ITEMS: readonly AppNavItem[] = NAV_ITEM_POLICIES.map(
  ({ href, label }) => ({ href, label }),
);
