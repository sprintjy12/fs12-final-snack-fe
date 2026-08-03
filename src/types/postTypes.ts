/**
 * Posts API가 주고받는 데이터 형식을 정의합니다.
 * users, snacks 같은 새 도메인도 응답 타입과 요청 타입을 구분해 작성합니다.
 */
export interface Post {
  id: number;
  title: string;
  content: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostParams {
  postId: number;
  request: UpdatePostRequest;
}

export type PostsResponse = Post[];
export type PostResponse = Post;
