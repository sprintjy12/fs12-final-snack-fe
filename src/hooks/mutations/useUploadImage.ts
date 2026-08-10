"use client";

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { ensureAccessToken } from "@/api/authApi";
import { getPresignedUrl } from "@/api/uploadApi";
import type { UploadImageResult } from "@/types/uploadTypes";

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/** 상품 이미지 샘플용 상한 (5MB). 서버에도 같은 제한이 있어야 합니다. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const imageFileSchema = z
  .instanceof(File, { message: "이미지 파일을 선택해 주세요." })
  .refine((file) => file.size > 0, {
    message: "빈 파일은 업로드할 수 없습니다.",
  })
  .refine((file) => file.size <= MAX_IMAGE_BYTES, {
    message: "이미지는 최대 5MB까지 업로드할 수 있습니다.",
  })
  .refine(
    (file) =>
      (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type),
    {
      message: "JPEG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.",
    },
  );

/**
 * 이미지 파일을 Presigned URL 방식으로 S3에 업로드합니다.
 *
 * 흐름
 * 1) 클라이언트에서 MIME·크기 검증 (accept는 UI 힌트일 뿐)
 * 2) 백엔드에 Presigned URL 발급 요청 (Axios + Bearer 토큰)
 * 3) 받은 uploadUrl로 파일 PUT (fetch)
 * 4) 성공 시 S3 Object Key 반환
 *
 * fetch를 쓰는 이유:
 * Presigned URL은 우리 API가 아니라 S3 등 외부 주소입니다.
 * 공통 Axios(apiClient)의 baseURL·Authorization 인터셉터가 붙으면
 * 서명된 URL 요청이 깨질 수 있어, 업로드 PUT만 fetch로 분리합니다.
 */
export const useUploadImage = () =>
  useMutation({
    mutationFn: async (file: File): Promise<UploadImageResult> => {
      const parsed = imageFileSchema.safeParse(file);
      if (!parsed.success) {
        throw new Error(
          parsed.error.issues[0]?.message ?? "유효하지 않은 파일입니다.",
        );
      }

      const validFile = parsed.data;
      await ensureAccessToken();

      const { uploadUrl, key } = await getPresignedUrl({
        fileName: validFile.name,
        contentType: validFile.type,
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": validFile.type,
        },
        body: validFile,
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `이미지 업로드에 실패했습니다. (HTTP ${uploadResponse.status})`,
        );
      }

      return { key };
    },
  });
