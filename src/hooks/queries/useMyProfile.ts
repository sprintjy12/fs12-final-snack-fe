"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyProfile } from "@/api/userApi";
import { queryKeys } from "@/constants/queryKeys";
import { getAccessToken } from "@/lib/authStorage";

/**
 * 내 프로필 조회(Query).
 * 컴포넌트는 Axios를 직접 호출하지 않고 이 Hook이 반환하는 상태를 사용합니다.
 */
export const useMyProfile = () => {
  const hasToken = Boolean(getAccessToken());

  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getMyProfile,
    enabled: hasToken,
  });
};
