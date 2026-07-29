import { apiClient } from "@/api/core/apiClient";
import type {
  CreatePostRequest,
  PostResponse,
  PostsResponse,
  UpdatePostParams,
} from "@/types/postTypes";

/**
 * Posts API 함수는 서버 요청과 응답 데이터 반환만 담당합니다.
 * 화면 상태와 캐시 처리는 Hook에 맡기며, 새 도메인은 이 파일의 함수 형태를 복사해 사용합니다.
 */
export const getPosts = async (): Promise<PostsResponse> => {
  const response = await apiClient.get<PostsResponse>("/posts");

  return response.data;
};

export const getPost = async (postId: number): Promise<PostResponse> => {
  const response = await apiClient.get<PostResponse>(`/posts/${postId}`);

  return response.data;
};

export const createPost = async (
  request: CreatePostRequest,
): Promise<PostResponse> => {
  const response = await apiClient.post<PostResponse>("/posts", request);

  return response.data;
};

export const updatePost = async ({
  postId,
  request,
}: UpdatePostParams): Promise<PostResponse> => {
  const response = await apiClient.put<PostResponse>(
    `/posts/${postId}`,
    request,
  );

  return response.data;
};

export const deletePost = async (postId: number): Promise<void> => {
  const response = await apiClient.delete<void>(`/posts/${postId}`);

  return response.data;
};
