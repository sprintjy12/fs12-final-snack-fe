"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyProfile } from "@/api/userApi";
import { queryKeys } from "@/constants/queryKeys";
import { getAccessToken } from "@/lib/authStorage";

/**
 * 내 프로필 조회(Query).
 * 컴포넌트는 Axios를 직접 호출하지 않고 이 Hook이 반환하는 상태를 사용합니다.
 *
 * access token이 없으면 enabled: false여도 남아 있는 users/me 캐시를
 * data로 노출하지 않습니다 (이전 사용자 정보 flash 방지).
 */
export const useMyProfile = () => {
  const hasToken = Boolean(getAccessToken());

  const query = useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getMyProfile,
    enabled: hasToken,
  });

  return {
    ...query,
    data: hasToken ? query.data : undefined,
  };
};
