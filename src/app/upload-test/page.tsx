"use client";

import { useState, type ChangeEvent } from "react";

import { useUploadImage } from "@/hooks/mutations/useUploadImage";

/**
 * Presigned URL 이미지 업로드 테스트 페이지.
 *
 * 실제 상품 등록과 연결하지 않은 샘플입니다.
 * 파일을 고르면 Presigned URL 발급 → S3 PUT → Object Key 출력까지 확인합니다.
 */
export default function UploadTestPage() {
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const uploadImageMutation = useUploadImage();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadedKey(null);
    uploadImageMutation.mutate(file, {
      onSuccess: (result) => {
        console.log("S3 Object Key:", result.key);
        console.log("Public image URL:", result.url);
        setUploadedKey(result.key);
      },
    });

    // 같은 파일을 다시 골라도 onChange가 동작하도록 초기화합니다.
    event.target.value = "";
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 bg-surface-muted px-6 py-16 text-foreground">
      <h1 className="text-2xl font-bold text-foreground-strong">
        이미지 업로드 테스트
      </h1>
      <p className="text-sm leading-6 text-foreground-muted">
        Presigned URL API로 S3에 이미지를 올리는 샘플입니다. 상품 등록 화면과는
        연결되어 있지 않습니다.
      </p>

      <label className="flex flex-col gap-2 text-sm font-medium text-foreground-strong">
        이미지 선택
        <input
          type="file"
          accept="image/*"
          disabled={uploadImageMutation.isPending}
          onChange={handleFileChange}
          className="rounded-lg border border-border bg-surface px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>

      {uploadImageMutation.isPending ? (
        <p className="text-sm text-foreground-muted">업로드 중…</p>
      ) : null}

      {uploadImageMutation.isError ? (
        <p className="text-sm text-snack-state-100">
          {uploadImageMutation.error instanceof Error
            ? uploadImageMutation.error.message
            : "이미지 업로드에 실패했습니다."}
        </p>
      ) : null}

      {uploadedKey ? (
        <div className="rounded-2xl border border-border bg-surface px-4 py-3">
          <p className="text-sm font-semibold text-foreground-strong">
            S3 Object Key
          </p>
          <p className="mt-1 break-all text-sm text-foreground-muted">
            {uploadedKey}
          </p>
        </div>
      ) : null}
    </main>
  );
}
