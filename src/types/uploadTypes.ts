/** POST /api/upload/presigned-url 요청 */
export type PresignedUrlRequest = {
  fileName: string;
  contentType: string;
};

/** POST /api/upload/presigned-url 응답 */
export type PresignedUrlResponse = {
  uploadUrl: string;
  key: string;
};

/** 이미지 업로드 mutation 성공 결과 */
export type UploadImageResult = {
  key: string;
};
