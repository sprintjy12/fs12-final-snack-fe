"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CommonImage } from "@/components/ui";
import { DUMMY_PRODUCTS } from "@/features/products/dummyProducts";
import { getCartItems, type CartItem } from "@/lib/cartStorage";
import { getProductPhotoSrc } from "@/lib/productMedia";
import type { Product } from "@/types/productTypes";

import styles from "./cart.module.css";

const SHIPPING_FEE = 3000;

type CartProduct = CartItem & {
  product: Product;
};

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

/** ① 장바구니 셸: 목록 + 주문 요약 (수량/선택/삭제·구매요청은 다음 단계) */
export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCartItems(getCartItems());
    setHydrated(true);
  }, []);

  const cartProducts = useMemo<CartProduct[]>(
    () =>
      cartItems.flatMap((item) => {
        const product = DUMMY_PRODUCTS.find(
          (candidate) => candidate.id === item.productId,
        );
        return product ? [{ ...item, product }] : [];
      }),
    [cartItems],
  );

  const productTotal = cartProducts.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  const shippingFee = cartProducts.length > 0 ? SHIPPING_FEE : 0;
  const orderTotal = productTotal + shippingFee;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.titleBar}>
          <h1 className={styles.title}>장바구니</h1>
        </div>

        {!hydrated ? (
          <div className={styles.loading} role="status">
            장바구니를 불러오는 중…
          </div>
        ) : cartProducts.length === 0 ? (
          <section className={styles.empty}>
            <CommonImage
              name="empty-purchase"
              size="md"
              className={styles.emptyIcon}
            />
            <h2 className={styles.emptyTitle}>장바구니가 비어 있습니다</h2>
            <p className={styles.emptyDescription}>
              원하는 상품을 장바구니에 담아 보세요.
            </p>
            <Link href="/products" className={styles.emptyLink}>
              상품 보러 가기
            </Link>
          </section>
        ) : (
          <div className={styles.cartLayout}>
            <section className={styles.cartSection} aria-label="장바구니 상품">
              <div className={styles.tableHeader}>
                <div className={styles.productHeader}>
                  <span>상품정보</span>
                </div>
                <div className={styles.headerCell}>수량</div>
                <div className={styles.headerCell}>주문 금액</div>
                <div className={styles.headerCell}>배송 정보</div>
              </div>

              <div className={styles.itemList}>
                {cartProducts.map(({ product, quantity }) => {
                  const photoSrc = getProductPhotoSrc(product.photo);
                  const lineTotal = product.price * quantity;

                  return (
                    <article className={styles.cartItem} key={product.id}>
                      <div className={styles.productCell}>
                        <Link
                          href={`/products/${product.id}?categoryId=${product.categoryId}&subCategoryId=${product.subCategoryId}`}
                          className={styles.productInfo}
                        >
                          <span className={styles.thumb}>
                            {photoSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={photoSrc}
                                alt=""
                                className={styles.image}
                                onError={(event) =>
                                  event.currentTarget.remove()
                                }
                              />
                            ) : null}
                          </span>
                          <span className={styles.productCopy}>
                            <span className={styles.productName}>
                              {product.name}
                            </span>
                            <strong className={styles.productPrice}>
                              {formatPrice(product.price)}
                            </strong>
                          </span>
                        </Link>
                      </div>

                      <div className={styles.tableCell}>
                        <div
                          className={styles.quantityField}
                          aria-label={`${product.name} 수량`}
                        >
                          <span>{quantity} 개</span>
                        </div>
                      </div>

                      <div className={`${styles.tableCell} ${styles.orderCell}`}>
                        <strong>{formatPrice(lineTotal)}</strong>
                      </div>

                      <div
                        className={`${styles.tableCell} ${styles.shippingCell}`}
                      >
                        <strong>{formatPrice(SHIPPING_FEE)}</strong>
                        <span>택배 배송</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <aside className={styles.summary}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryRows}>
                  <div className={styles.summaryRow}>
                    <span>총 주문 상품</span>
                    <strong className={styles.itemCount}>
                      {cartProducts.length}
                      <span>개</span>
                    </strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>상품금액</span>
                    <strong>{formatPrice(productTotal)}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>배송비</span>
                    <strong>{formatPrice(shippingFee)}</strong>
                  </div>
                </div>
                <hr className={styles.divider} />
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>총 주문금액</span>
                  <strong>{formatPrice(orderTotal)}</strong>
                </div>
              </div>

              <div className={styles.summaryActions}>
                <Link href="/products" className={styles.continueLink}>
                  계속 쇼핑하기
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
