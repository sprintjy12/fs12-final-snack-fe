"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { z } from "zod";

import { useCreatePost, useDeletePost, useUpdatePost } from "@/hooks/mutations/usePosts";
import { usePosts } from "@/hooks/queries/usePosts";

/**
 * =====================================================
 * 📘 API 연동 표준 예제
 *
 * 이 예제는 실제 서비스 화면이 아니라
 * 팀 내 API 연동 방식을 통일하기 위한 참고 코드입니다.
 *
 * 새로운 도메인을 추가할 때는
 *
 * 1. postApi.ts      → userApi.ts
 * 2. usePosts.ts     → useUsers.ts
 * 3. postTypes.ts    → userTypes.ts
 * 4. queryKeys.posts → queryKeys.users
 * 5. posts-sample 페이지는 API 연동 방식을 설명하기 위한 참고 예제입니다.
 *    실제 서비스에서는 페이지를 복사하지 말고 Hook과 API 함수만 재사용하세요.
 *
 * 와 같은 방식으로 복사하여 사용하면 됩니다.
 *
 * 흐름
 * Component
 *   ↓
 * TanStack Query Hook
 *   ↓
 * API 함수
 *   ↓
 * Axios(apiClient)
 *   ↓
 * Backend API
 * =====================================================
 */

/**
 * API → Hook → Component 호출 흐름을 보여주는 참고 페이지입니다.
 * 새 도메인에서는 Hook 이름과 요청 필드만 바꾸고 같은 로딩, 에러, mutation 흐름을 재사용합니다.
 */
const inputClassName =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-accent";
const buttonClassName =
  "rounded-lg bg-accent px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50";
const fieldErrorClassName = "mt-1 text-sm text-danger";

// required 속성만으로는 공백 입력을 막기 어려워
// Zod로 정제와 검증을 함께 처리합니다.
// 프론트 검증은 UX용이고, 백엔드 검증도 함께 필요합니다.
const postFormSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해 주세요."),
  content: z.string().trim().min(1, "내용을 입력해 주세요."),
});

type PostFormErrors = {
  title?: string;
  content?: string;
};

type UpdateFormErrors = PostFormErrors & {
  postId?: string;
};

const getPostFormErrors = (
  error: z.ZodError<z.infer<typeof postFormSchema>>,
): PostFormErrors => {
  const fieldErrors = error.flatten().fieldErrors;

  return {
    title: fieldErrors.title?.[0],
    content: fieldErrors.content?.[0],
  };
};

const PostsSamplePage = () => {
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createErrors, setCreateErrors] = useState<PostFormErrors>({});
  const [updatePostId, setUpdatePostId] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [updateErrors, setUpdateErrors] = useState<UpdateFormErrors>({});

  const {
    data: posts = [],
    isLoading,
    isError,
    refetch,
  } = usePosts();
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  const hasMutationError =
    createPostMutation.isError ||
    updatePostMutation.isError ||
    deletePostMutation.isError;

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // safeParse는 예외를 던지지 않아 화면에서 검증 결과를 바로 처리할 수 있습니다.
    const result = postFormSchema.safeParse({
      title: createTitle,
      content: createContent,
    });

    if (!result.success) {
      setCreateErrors(getPostFormErrors(result.error));
      return;
    }

    setCreateErrors({});
    // trim이 적용된 result.data를 mutation에 전달합니다.
    createPostMutation.mutate(result.data, {
      onSuccess: () => {
        setCreateTitle("");
        setCreateContent("");
      },
    });
  };

  const handleUpdateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const postId = Number(updatePostId);
    const nextErrors: UpdateFormErrors = {};

    if (!Number.isInteger(postId) || postId <= 0) {
      nextErrors.postId = "올바른 게시글 ID를 입력해 주세요.";
    }

    const result = postFormSchema.safeParse({
      title: updateTitle,
      content: updateContent,
    });

    if (!result.success) {
      Object.assign(nextErrors, getPostFormErrors(result.error));
    }

    if (nextErrors.postId || !result.success) {
      setUpdateErrors(nextErrors);
      return;
    }

    const request = result.data;
    setUpdateErrors({});
    updatePostMutation.mutate(
      {
        postId,
        request,
      },
      {
        onSuccess: () => {
          setUpdatePostId("");
          setUpdateTitle("");
          setUpdateContent("");
        },
      },
    );
  };

  const handleDeletePost = (postId: number) => {
    deletePostMutation.mutate(postId);
  };

  return (
    <main className="min-h-screen bg-surface-muted px-6 py-10 text-foreground">
      <div className="mx-auto max-w-3xl space-y-10">
        <header>
          <h1 className="text-3xl font-bold text-foreground-strong">
            Posts CRUD 예제
          </h1>
          <p className="mt-2 text-foreground-muted">
            실제 백엔드 연결 전, API와 TanStack Query 사용 패턴을 확인하기
            위한 참고 페이지입니다.
          </p>
        </header>

        <section aria-labelledby="create-post-title">
          <h2
            id="create-post-title"
            className="text-xl font-semibold text-foreground-strong"
          >
            게시글 생성
          </h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={handleCreateSubmit}
            noValidate
          >
            <div>
              <label htmlFor="create-title" className="mb-1 block font-medium">
                제목
              </label>
              <input
                id="create-title"
                value={createTitle}
                onChange={(event) => setCreateTitle(event.target.value)}
                className={inputClassName}
                required
                aria-invalid={Boolean(createErrors.title)}
                aria-describedby={
                  createErrors.title ? "create-title-error" : undefined
                }
              />
              {createErrors.title ? (
                <p
                  id="create-title-error"
                  role="alert"
                  className={fieldErrorClassName}
                >
                  {createErrors.title}
                </p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="create-content"
                className="mb-1 block font-medium"
              >
                내용
              </label>
              <textarea
                id="create-content"
                value={createContent}
                onChange={(event) => setCreateContent(event.target.value)}
                className={inputClassName}
                rows={3}
                required
                aria-invalid={Boolean(createErrors.content)}
                aria-describedby={
                  createErrors.content ? "create-content-error" : undefined
                }
              />
              {createErrors.content ? (
                <p
                  id="create-content-error"
                  role="alert"
                  className={fieldErrorClassName}
                >
                  {createErrors.content}
                </p>
              ) : null}
            </div>
            <button
              type="submit"
              className={buttonClassName}
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? "생성 중..." : "게시글 생성"}
            </button>
          </form>
        </section>

        <section aria-labelledby="update-post-title">
          <h2
            id="update-post-title"
            className="text-xl font-semibold text-foreground-strong"
          >
            게시글 수정
          </h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={handleUpdateSubmit}
            noValidate
          >
            <div>
              <label htmlFor="update-id" className="mb-1 block font-medium">
                게시글 ID
              </label>
              <input
                id="update-id"
                type="number"
                min={1}
                value={updatePostId}
                onChange={(event) => setUpdatePostId(event.target.value)}
                className={inputClassName}
                required
                aria-invalid={Boolean(updateErrors.postId)}
                aria-describedby={
                  updateErrors.postId ? "update-id-error" : undefined
                }
              />
              {updateErrors.postId ? (
                <p
                  id="update-id-error"
                  role="alert"
                  className={fieldErrorClassName}
                >
                  {updateErrors.postId}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="update-title" className="mb-1 block font-medium">
                제목
              </label>
              <input
                id="update-title"
                value={updateTitle}
                onChange={(event) => setUpdateTitle(event.target.value)}
                className={inputClassName}
                required
                aria-invalid={Boolean(updateErrors.title)}
                aria-describedby={
                  updateErrors.title ? "update-title-error" : undefined
                }
              />
              {updateErrors.title ? (
                <p
                  id="update-title-error"
                  role="alert"
                  className={fieldErrorClassName}
                >
                  {updateErrors.title}
                </p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="update-content"
                className="mb-1 block font-medium"
              >
                내용
              </label>
              <textarea
                id="update-content"
                value={updateContent}
                onChange={(event) => setUpdateContent(event.target.value)}
                className={inputClassName}
                rows={3}
                required
                aria-invalid={Boolean(updateErrors.content)}
                aria-describedby={
                  updateErrors.content ? "update-content-error" : undefined
                }
              />
              {updateErrors.content ? (
                <p
                  id="update-content-error"
                  role="alert"
                  className={fieldErrorClassName}
                >
                  {updateErrors.content}
                </p>
              ) : null}
            </div>
            <button
              type="submit"
              className={buttonClassName}
              disabled={updatePostMutation.isPending}
            >
              {updatePostMutation.isPending ? "수정 중..." : "게시글 수정"}
            </button>
          </form>
        </section>

        <section aria-labelledby="post-list-title">
          <h2
            id="post-list-title"
            className="text-xl font-semibold text-foreground-strong"
          >
            게시글 목록
          </h2>

          {isLoading ? (
            <p className="mt-4 text-foreground-muted">불러오는 중...</p>
          ) : isError ? (
            <div className="mt-4">
              <p role="alert" className="text-danger">
                게시글을 불러오지 못했습니다. 백엔드 연결 상태를 확인해 주세요.
              </p>
              <button
                type="button"
                className="mt-3 rounded-lg border border-border px-4 py-2 font-semibold"
                onClick={() => refetch()}
              >
                다시 시도
              </button>
            </div>
          ) : posts.length === 0 ? (
            <p className="mt-4 text-foreground-muted">게시글이 없습니다.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-foreground-muted">
                        ID: {post.id}
                      </p>
                      <h3 className="mt-1 font-semibold text-foreground-strong">
                        {post.title}
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap">{post.content}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link
                        href={`/posts-sample/${post.id}`}
                        className="rounded-lg border border-border px-3 py-2 font-semibold"
                      >
                        상세 보기
                      </Link>
                      <button
                        type="button"
                        className="rounded-lg border border-danger px-3 py-2 text-danger disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletePostMutation.isPending}
                      >
                        {deletePostMutation.isPending ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {hasMutationError ? (
          <p role="alert" className="text-danger">
            요청을 처리하지 못했습니다. 백엔드 연결 상태와 요청 형식을 확인해
            주세요.
          </p>
        ) : null}
      </div>
    </main>
  );
};

export default PostsSamplePage;
