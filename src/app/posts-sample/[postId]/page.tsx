"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { usePost } from "@/hooks/queries/usePosts";

/**
 * 목록에서 선택한 postId로 상세 Query를 호출하는 예제 페이지입니다.
 * Query Key에 ID를 포함하므로 게시글별 상세 데이터가 서로 다른 캐시로 관리됩니다.
 */
const PostDetailSamplePage = () => {
  const { postId: postIdParam } = useParams<{ postId: string }>();
  const postId = Number(postIdParam);
  const isValidPostId = Number.isInteger(postId) && postId > 0;
  const { data: post, isLoading, isError } = usePost(postId);

  if (!isValidPostId) {
    return (
      <main className="min-h-screen bg-surface-muted px-6 py-10 text-foreground">
        <p role="alert" className="mx-auto max-w-3xl text-danger">
          올바른 게시글 ID가 아닙니다.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-muted px-6 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/posts-sample"
          className="font-semibold text-foreground-muted"
        >
          ← 목록으로
        </Link>

        {isLoading ? (
          <p className="mt-8 text-foreground-muted">불러오는 중...</p>
        ) : isError ? (
          <p role="alert" className="mt-8 text-danger">
            게시글을 불러오지 못했습니다. 백엔드 연결 상태를 확인해 주세요.
          </p>
        ) : post ? (
          <article className="mt-8 rounded-xl border border-border bg-surface p-6">
            <p className="text-sm text-foreground-muted">ID: {post.id}</p>
            <h1 className="mt-2 text-2xl font-bold text-foreground-strong">
              {post.title}
            </h1>
            <p className="mt-4 whitespace-pre-wrap">{post.content}</p>
          </article>
        ) : (
          <p className="mt-8 text-foreground-muted">게시글이 없습니다.</p>
        )}
      </div>
    </main>
  );
};

export default PostDetailSamplePage;
