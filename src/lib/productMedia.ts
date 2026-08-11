/** photo 파일명 → 실제 이미지 경로. CDN/S3 base 확정 시 수정 */
export function getProductPhotoSrc(photo: string) {
  if (!photo) return null;
  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, "");
  if (base) {
    return `${base}/${photo}`;
  }
  return `/products/${photo}`;
}

/**
 * Presigned uploadUrl / Object Key → 상품 API에 넣을 공개 imageUrl.
 * 1) NEXT_PUBLIC_IMAGE_BASE_URL + key
 * 2) uploadUrl에서 서명 쿼리 제거 (https://bucket.../key)
 */
export function toPublicImageUrl(key: string, uploadUrl?: string) {
  const trimmedKey = key.replace(/^\//, "");
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, "");
  if (base) {
    return `${base}/${trimmedKey}`;
  }

  if (uploadUrl) {
    try {
      const parsed = new URL(uploadUrl);
      return `${parsed.origin}${parsed.pathname}`;
    } catch {
      // fall through
    }
  }

  return trimmedKey;
}
