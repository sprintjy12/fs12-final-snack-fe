"use client";

import { useQuery } from "@tanstack/react-query";

import { getPost, getPosts } from "@/api/postApi";
import { queryKeys } from "@/constants/queryKeys";

/**
 * Posts 조회(Query) 훅.
 * 컴포넌트는 Axios를 직접 호출하지 않고 이 Hook이 반환하는 상태를 사용합니다.
 */
export const usePosts = () =>
  useQuery({
    queryKey: queryKeys.posts.list(),
    queryFn: getPosts,
  });

export const usePost = (postId: number) =>
  useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => getPost(postId),
    enabled: Number.isInteger(postId) && postId > 0,
  });
