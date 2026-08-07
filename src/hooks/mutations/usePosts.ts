"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPost, deletePost, updatePost } from "@/api/postApi";
import { queryKeys } from "@/constants/queryKeys";

/**
 * Posts 쓰기(Mutation) 훅.
 * 성공 후 posts 캐시를 무효화해 목록·상세 Query가 최신 데이터를 다시 요청합니다.
 */
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
