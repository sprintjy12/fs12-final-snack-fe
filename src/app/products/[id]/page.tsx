"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  DeleteProductModal,
  type DeleteProductTarget,
} from "@/app/products/mine/DeleteProductModal";
import { ProductMineMenu } from "@/app/products/mine/ProductMineMenu";
import { Icon } from "@/components/ui";
import { queryKeys } from "@/constants/queryKeys";
import { ProductEditModal } from "@/features/products/ProductEditModal";
import { useAddToCart } from "@/hooks/mutations/useCart";
import { useMyProfile } from "@/hooks/queries/useMyProfile";
import { useProduct } from "@/hooks/queries/useProducts";
import { getProductPhotoSrc } from "@/lib/productMedia";
import type { Product } from "@/types/productTypes";

import styles from "./productDetail.module.css";

/** 시안 고정 문구 (API 필드 없음) */
const DETAIL_COPY = {
  benefit: "5포인트 적립 예정",
  shippingMethod: "택배",
  shippingFee: "3,000원(50,000원 이상 무료배송)",
  shippingExtra: "도서산간 배송비 추가",
} as const;

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function DetailSkeleton() {
  return (
    <div className={styles.main} aria-hidden="true">
      <div className={`${styles.gallery} ${styles.skeletonBlock}`} />
      <div className={styles.info}>
        <div className={styles.headerBlock}>
          <div className={`${styles.skeletonLine} ${styles.skeletonSm}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonLg}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonBadge}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonLg}`} />
        </div>
        <div className={styles.divider} />
        <div className={`${styles.skeletonLine} ${styles.skeletonMd}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonMd}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonMd}`} />
        <div className={styles.divider} />
        <div className={styles.actions}>
          <div className={`${styles.skeletonBlock} ${styles.skeletonQty}`} />
          <div className={`${styles.skeletonBlock} ${styles.skeletonCta}`} />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { data: product, isLoading, isError } = useProduct(id);
  const { data: me } = useMyProfile();
  const [quantity, setQuantity] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteProductTarget | null>(
    null,
  );

  useEffect(() => {
    setQuantity(1);
    setImageFailed(false);
    setFeedback(null);
    setEditOpen(false);
    setDeleteTarget(null);
  }, [id]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const photoSrc = product ? getProductPhotoSrc(product.photo) : null;
  const showImage = Boolean(photoSrc) && !imageFailed;
  const categoryLabel =
    product?.category?.name && product?.subCategory?.name
      ? `${product.category.name} · ${product.subCategory.name}`
      : (product?.subCategory?.name ?? product?.category?.name ?? null);

  const isMine = Boolean(
    me?.id &&
      product?.createdById &&
      String(me.id) === String(product.createdById),
  );

  const addToCartMutation = useAddToCart();

  const decrease = () => setQuantity((value) => Math.max(1, value - 1));
  const increase = () => setQuantity((value) => Math.min(999, value + 1));

  const handleAddToCart = () => {
    if (!product || addToCartMutation.isPending) return;
    if (!product.id) {
      setFeedback({
        type: "error",
        message: "유효하지 않은 상품입니다. 다시 시도해 주세요.",
      });
      return;
    }
    addToCartMutation.mutate(
      { productId: String(product.id), quantity },
      {
        onSuccess: () => {
          setFeedback({
            type: "success",
            message: `장바구니에 ${product.name} 상품을 담았습니다.`,
          });
        },
        onError: () => {
          setFeedback({
            type: "error",
            message: "장바구니에 담지 못했습니다. 다시 시도해 주세요.",
          });
        },
      },
    );
  };

  const handleProductUpdated = (updated: Product) => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.products.detail(String(updated.id)),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.products.all,
    });
  };

  const handleProductDeleted = () => {
    router.push("/products/mine");
  };

  if (!id) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={`${styles.status} ${styles.statusError}`}>
            잘못된 상품 주소입니다.
          </p>
          <p className={styles.status}>
            <Link href="/products" className={styles.breadcrumbLink}>
              상품 리스트로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.srOnly}>상품을 불러오는 중</p>
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={`${styles.status} ${styles.statusError}`}>
            상품을 찾을 수 없습니다.
          </p>
          <p className={styles.status}>
            <Link href="/products" className={styles.breadcrumbLink}>
              상품 리스트로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <nav aria-label="브레드크럼">
          <ol className={styles.breadcrumb}>
            <li className={styles.breadcrumbItem}>
              <Link href="/" className={styles.breadcrumbLink}>
                홈
              </Link>
              <Icon
                name="chevron-right"
                size="sm"
                className={styles.breadcrumbSep}
              />
            </li>
            {product.category?.name ? (
              <li className={styles.breadcrumbItem}>
                <Link
                  href={`/products?categoryId=${product.categoryId}`}
                  className={styles.breadcrumbLink}
                >
                  {product.category.name}
                </Link>
                <Icon
                  name="chevron-right"
                  size="sm"
                  className={styles.breadcrumbSep}
                />
              </li>
            ) : null}
            {product.subCategory?.name &&
            product.subCategory.name !== product.category?.name ? (
              <li className={styles.breadcrumbItem}>
                <Link
                  href={`/products?categoryId=${product.categoryId}&subCategoryId=${product.subCategoryId}`}
                  className={styles.breadcrumbLink}
                >
                  {product.subCategory.name}
                </Link>
                <Icon
                  name="chevron-right"
                  size="sm"
                  className={styles.breadcrumbSep}
                />
              </li>
            ) : null}
            <li className={styles.breadcrumbItem} aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className={styles.main}>
          <div className={styles.gallery}>
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
          </div>

          <div className={styles.info}>
            <div className={styles.headerBlock}>
              <div className={styles.headerTop}>
                <div className={styles.titleBlock}>
                  {categoryLabel ? (
                    <p className={styles.category}>{categoryLabel}</p>
                  ) : null}
                  <h1 className={styles.name}>{product.name}</h1>
                </div>
                {isMine ? (
                  <ProductMineMenu
                    productName={product.name}
                    size="md"
                    onEdit={() => setEditOpen(true)}
                    onDelete={() =>
                      setDeleteTarget({
                        id: String(product.id),
                        name: product.name,
                      })
                    }
                  />
                ) : null}
              </div>
              {typeof product.purchaseCount === "number" ? (
                <span className={styles.purchaseBadge}>
                  {product.purchaseCount}회 구매
                </span>
              ) : null}
              <p className={styles.price}>{formatPrice(product.price)}</p>
            </div>

            <hr className={styles.divider} />

            <dl className={styles.metaList}>
              <div className={styles.metaRow}>
                <dt className={styles.metaLabel}>구매혜택</dt>
                <dd className={styles.metaValue}>{DETAIL_COPY.benefit}</dd>
              </div>
              <div className={styles.metaRow}>
                <dt className={styles.metaLabel}>배송방법</dt>
                <dd className={styles.metaValue}>
                  {DETAIL_COPY.shippingMethod}
                </dd>
              </div>
              <div className={styles.metaRow}>
                <dt className={styles.metaLabel}>배송비</dt>
                <dd className={styles.metaValue}>{DETAIL_COPY.shippingFee}</dd>
                <dd className={styles.metaMuted}>{DETAIL_COPY.shippingExtra}</dd>
              </div>
            </dl>

            <hr className={styles.divider} />

            <div className={styles.actions}>
              <div
                className={styles.qtyField}
                role="group"
                aria-label="구매 수량"
              >
                <span className={styles.qtyValue} aria-live="polite">
                  {quantity}
                </span>
                <span className={styles.qtyUnit}>개</span>
                <div className={styles.qtyControls}>
                  <button
                    type="button"
                    className={styles.qtyButton}
                    aria-label="수량 증가"
                    onClick={increase}
                  >
                    <Icon
                      name="chevron-up"
                      size="xs"
                      className={styles.qtyIcon}
                    />
                  </button>
                  <button
                    type="button"
                    className={styles.qtyButton}
                    aria-label="수량 감소"
                    onClick={decrease}
                    disabled={quantity <= 1}
                  >
                    <Icon
                      name="chevron-down"
                      size="xs"
                      className={styles.qtyIcon}
                    />
                  </button>
                </div>
              </div>

              <button
                type="button"
                className={styles.addCart}
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                aria-busy={addToCartMutation.isPending}
              >
                {addToCartMutation.isPending
                  ? "담는 중..."
                  : "장바구니 담기"}
              </button>
            </div>

            {feedback ? (
              <p
                className={`${styles.feedback} ${feedback.type === "error" ? styles.feedbackError : ""}`}
                role={feedback.type === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {feedback.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <ProductEditModal
        open={editOpen}
        product={product}
        onClose={() => setEditOpen(false)}
        onUpdated={handleProductUpdated}
      />

      <DeleteProductModal
        open={Boolean(deleteTarget)}
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleProductDeleted}
      />
    </div>
  );
}
