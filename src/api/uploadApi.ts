import { apiClient } from "@/api/core/apiClient";
import type {
  PresignedUrlRequest,
  PresignedUrlResponse,
} from "@/types/uploadTypes";

/**
 * S3에 직접 올릴 수 있는 Presigned URL을 발급받습니다.
 *
 * 파일 바이너리를 우리 백엔드로 보내지 않고, 짧은 시간만 유효한 업로드 URL을
 * 받아 클라이언트가 S3에 바로 PUT 하도록 하기 위한 API입니다.
 * (서버 부하·대역폭을 줄이고, 백엔드에 파일을 임시 저장하지 않아도 됩니다.)
 */
export const getPresignedUrl = async (
  request: PresignedUrlRequest,
): Promise<PresignedUrlResponse> => {
  const response = await apiClient.post<PresignedUrlResponse>(
    "/api/upload/presigned-url",
    request,
  );

  return response.data;
};
