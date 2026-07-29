"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from "@/api/postApi";
import { queryKeys } from "@/constants/queryKeys";

/**
 * Posts Hook은 API 함수를 TanStack Query와 연결해 로딩, 에러, 캐시 상태를 관리합니다.
 * 컴포넌트는 Axios를 직접 호출하지 않고 이 Hook이 반환하는 상태와 mutate만 사용합니다.
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

// 쓰기 성공 후 posts 캐시를 무효화하면 활성화된 목록과 상세 Query가 최신 데이터를 다시 요청합니다.
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.all,
      }),
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.all,
      }),
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.all,
      }),
  });
};
