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
