/** POST /api/upload/presigned-url 요청 */
export type PresignedUrlRequest = {
  fileName: string;
  contentType: string;
  /** 실제 파일 바이트 수. Content-Length 서명과 일치해야 합니다. */
  fileSize: number;
};

/** POST /api/upload/presigned-url 응답 */
export type PresignedUrlResponse = {
  /** S3 PUT용 서명 URL (쿼리 포함, 만료됨) */
  uploadUrl: string;
  /** 버킷 내 Object Key (예: images/uuid-name.png) */
  key: string;
};

/** 이미지 업로드 mutation 성공 결과 */
export type UploadImageResult = {
  key: string;
  /**
   * 상품 API imageUrl에 넣을 공개 URL.
   * uploadUrl에서 서명 쿼리를 제거한 값 (또는 IMAGE_BASE_URL + key).
   */
  url: string;
};
