"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyProfile } from "@/api/userApi";
import { queryKeys } from "@/constants/queryKeys";
import { getAccessToken } from "@/lib/authStorage";

type UseMyProfileOptions = {
  /** false면 /users/me 요청을 하지 않습니다. 기본값 true (hasToken과 AND). */
  enabled?: boolean;
};

/**
 * 내 프로필 조회(Query).
 * 컴포넌트는 Axios를 직접 호출하지 않고 이 Hook이 반환하는 상태를 사용합니다.
 *
 * - access token이 없으면 캐시 data를 노출하지 않음
 * - 조회 실패(isError) 시에도 cached role이 Header 등에 쓰이지 않도록 data를 숨김
 */
export const useMyProfile = (options?: UseMyProfileOptions) => {
  const hasToken = Boolean(getAccessToken());
  const queryEnabled = hasToken && (options?.enabled ?? true);

  const query = useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getMyProfile,
    enabled: queryEnabled,
  });

  return {
    ...query,
    data: queryEnabled && !query.isError ? query.data : undefined,
  };
};
