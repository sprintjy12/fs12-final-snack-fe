"use client";

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { ensureAccessToken } from "@/api/authApi";
import { getPresignedUrl } from "@/api/uploadApi";
import { toPublicImageUrl } from "@/lib/productMedia";
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
 * 1) 클라이언트에서 MIME·크기 검증
 * 2) 백엔드에 Presigned URL 발급 (fileName, contentType, fileSize)
 * 3) 받은 uploadUrl로 브라우저가 S3에 직접 PUT
 * 4) 공개 URL(url) + Object Key 반환 → 상품 등록 imageUrl에 사용
 *
 * S3 버킷 CORS에 FE origin(AllowedOrigins)과 PUT이 열려 있어야 합니다.
 * Axios를 쓰면 baseURL·Authorization이 붙어 서명이 깨질 수 있어 fetch만 사용합니다.
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
        fileSize: validFile.size,
      });

      // SignedHeaders가 content-length;host 인 경우 Content-Type을 넣으면
      // preflight/서명과 어긋날 수 있어 body만 전송합니다.
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: validFile,
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `이미지 업로드에 실패했습니다. (HTTP ${uploadResponse.status})`,
        );
      }

      return {
        key,
        url: toPublicImageUrl(key, uploadUrl),
      };
    },
  });
