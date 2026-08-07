"use client";

import { useMutation } from "@tanstack/react-query";

import { ensureAccessToken } from "@/api/authApi";
import { getPresignedUrl } from "@/api/uploadApi";
import type { UploadImageResult } from "@/types/uploadTypes";

/**
 * 이미지 파일을 Presigned URL 방식으로 S3에 업로드합니다.
 *
 * 흐름
 * 1) 백엔드에 Presigned URL 발급 요청 (Axios + Bearer 토큰)
 * 2) 받은 uploadUrl로 파일 PUT (fetch)
 * 3) 성공 시 S3 Object Key 반환
 *
 * fetch를 쓰는 이유:
 * Presigned URL은 우리 API가 아니라 S3 등 외부 주소입니다.
 * 공통 Axios(apiClient)의 baseURL·Authorization 인터셉터가 붙으면
 * 서명된 URL 요청이 깨질 수 있어, 업로드 PUT만 fetch로 분리합니다.
 */
export const useUploadImage = () =>
  useMutation({
    mutationFn: async (file: File): Promise<UploadImageResult> => {
      await ensureAccessToken();

      const { uploadUrl, key } = await getPresignedUrl({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `이미지 업로드에 실패했습니다. (HTTP ${uploadResponse.status})`,
        );
      }

      return { key };
    },
  });
