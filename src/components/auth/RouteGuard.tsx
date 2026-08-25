"use client";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  BELOW_HEADER_MIN_H,
  ForbiddenPage,
} from "@/components/auth/ForbiddenPage";
import { Button } from "@/components/ui";
import {
  canAccessPath,
  isGuardExemptPath,
  isProtectedPath,
} from "@/constants/accessControl";
import { useMyProfile } from "@/hooks/queries/useMyProfile";
import { clearClientSession } from "@/hooks/useClientLogout";
import { getAccessToken } from "@/lib/authStorage";

type RouteGuardProps = {
  children: ReactNode;
};

/**
 * path 정책(accessControl) 기준 인증·인가 가드.
 * - 비보호/면제 경로: 통과
 * - 보호 + 비로그인: /login
 * - 보호 + 권한 없음: URL 유지 + ForbiddenPage (GNB는 layout AppHeader)
 * - users/me 401: 세션·캐시 정리 후 /login
 * - users/me 403: URL 유지 + ForbiddenPage
 * - users/me 일반 오류(5xx/네트워크): redirect 없이 재시도 UI
 * profile 로딩 중에는 children을 렌더하지 않아 권한 페이지 flash를 막습니다.
 */
export const RouteGuard = ({ children }: RouteGuardProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  // SSR·클라 첫 렌더는 토큰 없음으로 맞춰 hydration mismatch 방지
  const [hasToken, setHasToken] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const protectedPath = isProtectedPath(pathname);
  const exemptPath = isGuardExemptPath(pathname);
  const shouldFetchProfile =
    authReady && protectedPath && !exemptPath && hasToken;

  const { data: profile, isPending, isError, error, refetch, isFetching } =
    useMyProfile({ enabled: shouldFetchProfile });

  const isUnauthorized =
    isError &&
    axios.isAxiosError(error) &&
    error.response?.status === 401;

  const isForbidden =
    isError &&
    axios.isAxiosError(error) &&
    error.response?.status === 403;

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady || exemptPath || !protectedPath) {
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
      let cancelled = false;

      void clearClientSession(queryClient).then(() => {
        if (!cancelled) {
          router.replace("/login");
        }
      });

      return () => {
        cancelled = true;
      };
    }

    // 권한 없음·5xx/네트워크 오류: URL 유지, 아래 render에서 fallback UI
  }, [
    authReady,
    exemptPath,
    protectedPath,
    hasToken,
    isPending,
    isUnauthorized,
    pathname,
    router,
    queryClient,
  ]);

  if (exemptPath || !protectedPath) {
    return children;
  }

  if (!authReady || !hasToken) {
    return null;
  }

  if (isPending) {
    return null;
  }

  if (isUnauthorized) {
    return null;
  }

  if (isForbidden) {
    return <ForbiddenPage />;
  }

  if (isError) {
    return (
      <main
        className={`flex w-full flex-col items-center justify-center gap-3 bg-surface-muted px-6 ${BELOW_HEADER_MIN_H}`}
      >
        <p className="m-0 text-center text-base text-snack-black-100">
          사용자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        <Button
          type="button"
          variant="outline"
          size="compact"
          disabled={isFetching}
          onClick={() => {
            void refetch();
          }}
        >
          다시 시도
        </Button>
      </main>
    );
  }

  const role = profile?.role;
  if (!role || !canAccessPath(pathname, role)) {
    return <ForbiddenPage />;
  }

  return children;
};
