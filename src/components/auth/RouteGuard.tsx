"use client";

import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import {
  canAccessPath,
  isGuardExemptPath,
  isProtectedPath,
} from "@/constants/accessControl";
import { useMyProfile } from "@/hooks/queries/useMyProfile";
import { clearAccessToken, getAccessToken } from "@/lib/authStorage";

type RouteGuardProps = {
  children: ReactNode;
};

/**
 * path 정책(accessControl) 기준 인증·인가 가드.
 * - 비보호/면제 경로: 통과
 * - 보호 + 비로그인: /login
 * - 보호 + 권한 없음: /products
 * profile 로딩 중에는 children을 렌더하지 않아 권한 페이지 flash를 막습니다.
 */
export const RouteGuard = ({ children }: RouteGuardProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const hasToken = Boolean(getAccessToken());
  const protectedPath = isProtectedPath(pathname);
  const exemptPath = isGuardExemptPath(pathname);

  const { data: profile, isPending, isError, error } = useMyProfile();

  const isUnauthorized =
    isError &&
    axios.isAxiosError(error) &&
    error.response?.status === 401;

  useEffect(() => {
    if (exemptPath || !protectedPath) {
      return;
    }

    if (!hasToken) {
      router.replace("/login");
      return;
    }

    if (isPending) {
      return;
    }

    if (isUnauthorized) {
      clearAccessToken();
      router.replace("/login");
      return;
    }

    if (isError) {
      router.replace("/products");
      return;
    }

    const role = profile?.role;
    if (!role || !canAccessPath(pathname, role)) {
      router.replace("/products");
    }
  }, [
    exemptPath,
    protectedPath,
    hasToken,
    isPending,
    isError,
    isUnauthorized,
    profile?.role,
    pathname,
    router,
  ]);

  if (exemptPath || !protectedPath) {
    return children;
  }

  if (!hasToken) {
    return null;
  }

  if (isPending) {
    return null;
  }

  if (isUnauthorized || isError) {
    return null;
  }

  const role = profile?.role;
  if (!role || !canAccessPath(pathname, role)) {
    return null;
  }

  return children;
};
