"use client";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

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
 * 렌더 판단 결과: 렌더는 이 값 하나로만 분기합니다(다른 조건 재확인 없음).
 * - pass: children 그대로 통과
 * - waiting: 리다이렉트 대기 중 — 위 useEffect가 처리, 여기서는 아무것도 렌더하지 않음
 * - forbidden / error: 각각의 fallback 컴포넌트 렌더
 */
type GuardState = "pass" | "waiting" | "forbidden" | "error";

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
  const hasToken = Boolean(getAccessToken());
  const protectedPath = isProtectedPath(pathname);
  const exemptPath = isGuardExemptPath(pathname);
  const shouldFetchProfile = protectedPath && !exemptPath && hasToken;

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
    exemptPath,
    protectedPath,
    hasToken,
    isPending,
    isUnauthorized,
    pathname,
    router,
    queryClient,
  ]);

  const role = profile?.role;

  const resolveGuardState = (): GuardState => {
    if (exemptPath || !protectedPath) {
      return "pass";
    }
    if (!hasToken || isPending || isUnauthorized) {
      return "waiting";
    }
    if (isForbidden) {
      return "forbidden";
    }
    if (isError) {
      return "error";
    }
    if (!role || !canAccessPath(pathname, role)) {
      return "forbidden";
    }
    return "pass";
  };

  switch (resolveGuardState()) {
    case "pass":
      return children;

    case "waiting":
      return null;

    case "forbidden":
      return <ForbiddenPage />;

    case "error":
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
};
