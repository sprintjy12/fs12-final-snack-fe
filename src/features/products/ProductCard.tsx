"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";

import { getProductPhotoSrc } from "@/lib/productMedia";
import type { Product } from "@/types/productTypes";

import styles from "./ProductCard.module.css";

export type ProductCardProps = {
  product: Product;
  /** Figma: Card/상품리스트_좋아요 — 기본 리스트 카드에는 없음 */
  showLike?: boolean;
  liked?: boolean;
  onToggleLike?: (productId: number | string) => void;
};

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function formatCategoryLabel(product: Product) {
  return product.subCategory?.name ?? product.category?.name ?? null;
}

function buildProductHref(product: Product) {
  const params = new URLSearchParams();
  params.set("categoryId", String(product.categoryId));
  params.set("subCategoryId", String(product.subCategoryId));
  return `/products/${product.id}?${params.toString()}`;
}

/**
 * Figma DS: Card/상품리스트 md (`1:10544`)
 * 이미지 → (소분류 | 구매뱃지) → 상품명 → 가격
 */
export function ProductCard({
  product,
  showLike = false,
  liked = false,
  onToggleLike,
}: ProductCardProps) {
  const categoryLabel = formatCategoryLabel(product);
  const photoSrc = getProductPhotoSrc(product.photo);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(photoSrc) && !imageFailed;

  const handleLikeClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleLike?.(product.id);
  };

  return (
    <article className={styles.card}>
      <Link href={buildProductHref(product)} className={styles.link}>
        <div className={styles.thumb}>
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoSrc!}
              alt={product.name}
              className={styles.image}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className={styles.placeholder} aria-hidden="true">
              🍪
            </span>
          )}
          {showLike ? (
            <button
              type="button"
              className={[styles.likeButton, liked ? styles.liked : null]
                .filter(Boolean)
                .join(" ")}
              aria-label={liked ? "좋아요 취소" : "좋아요"}
              aria-pressed={liked}
              onClick={handleLikeClick}
            >
              {liked ? "♥" : "♡"}
            </button>
          ) : null}
        </div>

        <div className={styles.body}>
          <div className={styles.metaBlock}>
            <div className={styles.metaRow}>
              {categoryLabel ? (
                <p className={styles.category}>{categoryLabel}</p>
              ) : (
                <span />
              )}
              {typeof product.purchaseCount === "number" ? (
                <span className={styles.purchaseBadge}>
                  {product.purchaseCount}회 구매
                </span>
              ) : null}
            </div>
            <h2 className={styles.name}>{product.name}</h2>
          </div>
          <p className={styles.price}>{formatPrice(product.price)}</p>
        </div>
      </Link>
    </article>
  );
}
