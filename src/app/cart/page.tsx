"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CommonImage, Icon } from "@/components/ui";
import { DUMMY_PRODUCTS } from "@/features/products/dummyProducts";
import {
  clearCart,
  getCartItems,
  removeFromCart,
  removeFromCartMany,
  setCartQuantity,
  type CartItem,
} from "@/lib/cartStorage";
import { getProductPhotoSrc } from "@/lib/productMedia";
import type { Product } from "@/types/productTypes";

const SHIPPING_FEE = 3000;
const MAX_QUANTITY = 999;

type CartProduct = CartItem & {
  product: Product;
};

type ProductId = CartItem["productId"];
function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  /** undefined: 전체 선택(초기) · []: 선택 없음 · ProductId[]: 부분 선택 */
  const [selectedIds, setSelectedIds] = useState<ProductId[] | undefined>(
    undefined,
  );
  const [hydrated, setHydrated] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState<Set<ProductId>>(
    () => new Set(),
  );

  useEffect(() => {
    const items = getCartItems();
    setCartItems(items);
    // 초기 전체 선택: undefined 유지 ([]는 선택 없음)
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

  const allProductIds = useMemo(
    () => cartProducts.map((item) => item.product.id),
    [cartProducts],
  );

  const effectiveSelectedIds = selectedIds ?? allProductIds;

  const selectedProducts = cartProducts.filter((item) =>
    effectiveSelectedIds.includes(item.product.id),
  );
  const allSelected =
    cartProducts.length > 0 && selectedProducts.length === cartProducts.length;
  const someSelected = selectedProducts.length > 0;

  const productTotal = selectedProducts.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  const shippingFee = someSelected ? SHIPPING_FEE : 0;
  const orderTotal = productTotal + shippingFee;

  const syncCart = (next: CartItem[]) => {
    setCartItems(next);
    setSelectedIds((prev) => {
      if (prev === undefined) return undefined;
      return prev.filter((id) => next.some((item) => item.productId === id));
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(undefined);
  };

  const toggleSelect = (productId: ProductId) => {
    setSelectedIds((prev) => {
      const current = prev ?? allProductIds;
      return current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
    });
  };

  const changeQuantity = (productId: ProductId, nextQuantity: number) => {
    syncCart(setCartQuantity(productId, nextQuantity));
  };

  const handleRemoveOne = (productId: ProductId) => {
    syncCart(removeFromCart(productId));
  };

  const handleRemoveSelected = () => {
    if (!someSelected) return;
    syncCart(removeFromCartMany(effectiveSelectedIds));
  };

  const handleClearAll = () => {
    syncCart(clearCart());
  };

  const rowGrid =
    "grid min-w-[1000px] grid-cols-[minmax(380px,1fr)_repeat(3,180px)] xl:min-w-0 xl:grid-cols-[minmax(454px,1fr)_repeat(3,220px)] max-[1400px]:grid-cols-[minmax(380px,1fr)_repeat(3,180px)]";

  return (
    <main className="min-h-[calc(100vh-88px)] w-full bg-surface-muted">
      <div className="mx-auto min-h-0 w-full max-w-[1920px] px-4 pb-12 md:min-h-[1182px] md:px-10 md:pb-20 xl:px-[120px]">
        <div className="flex h-[104px] items-center px-0 py-6 md:h-[144px] md:px-2.5 md:py-10">
          <h1 className="m-0 text-2xl leading-9 font-semibold text-foreground-strong md:text-[32px] md:leading-[42px]">
            장바구니
          </h1>
        </div>

        {!hydrated ? (
          <div
            className="flex min-h-[420px] items-center justify-center"
            role="status"
          >
            장바구니를 불러오는 중…
          </div>
        ) : cartProducts.length === 0 ? (
          <section className="flex min-h-[420px] flex-col items-center justify-center gap-3 border-y border-snack-gray-300">
            <CommonImage
              name="empty-purchase"
              size="md"
              className="h-auto w-full max-w-[280px]"
            />
            <h2 className="mt-1 mb-0 text-2xl leading-8 text-foreground-strong">
              장바구니가 비어 있습니다
            </h2>
            <p className="m-0 text-base leading-[26px] text-foreground-strong">
              원하는 상품을 장바구니에 담아 보세요.
            </p>
            <Link
              href="/products"
              className="mt-3 rounded-2xl bg-accent px-6 py-3 text-lg font-semibold text-surface"
            >
              상품 보러 가기
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 items-start gap-10 max-[1100px]:grid-cols-1 min-[1101px]:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1254px)_386px] max-[1400px]:min-[1101px]:grid-cols-[minmax(0,1fr)_340px]">
            <section className="min-w-0 max-[1100px]:overflow-x-auto" aria-label="장바구니 상품">
              <div
                className={cx(
                  rowGrid,
                  "h-20 border-y border-snack-gray-300 text-xl leading-8 text-snack-black-100",
                )}
              >
                <div className="flex items-center gap-8 pl-6">
                  <button
                    type="button"
                    className={cx(
                      "grid size-[26px] shrink-0 place-items-center rounded border border-snack-gray-300 bg-transparent p-0 text-[17px] leading-none text-surface",
                      allSelected && "border-accent bg-accent",
                    )}
                    aria-label={allSelected ? "전체 선택 해제" : "전체 선택"}
                    aria-pressed={allSelected}
                    onClick={toggleSelectAll}
                  >
                    {allSelected ? <span aria-hidden="true">✓</span> : null}
                  </button>
                  <span>상품정보</span>
                </div>
                <div className="grid place-items-center border-l border-snack-gray-300">
                  수량
                </div>
                <div className="grid place-items-center border-l border-snack-gray-300">
                  주문 금액
                </div>
                <div className="grid place-items-center border-l border-snack-gray-300">
                  배송 정보
                </div>
              </div>

              <div className="flex flex-col">
                {cartProducts.map(({ product, quantity }) => {
                  const photoSrc = getProductPhotoSrc(product.photo);
                  const showImage =
                    Boolean(photoSrc) && !failedImageIds.has(product.id);
                  const lineTotal = product.price * quantity;
                  const isSelected = effectiveSelectedIds.includes(product.id);

                  return (
                    <article
                      className={cx(rowGrid, "min-h-[208px] bg-surface-muted")}
                      key={product.id}
                    >
                      <div className="relative flex min-w-0 items-start gap-8 border-b border-snack-gray-300 p-6">
                        <button
                          type="button"
                          className={cx(
                            "grid size-[26px] shrink-0 place-items-center rounded border border-snack-gray-300 bg-transparent p-0 text-[17px] leading-none text-surface",
                            isSelected && "border-accent bg-accent",
                          )}
                          aria-label={`${product.name} 선택`}
                          aria-pressed={isSelected}
                          onClick={() => toggleSelect(product.id)}
                        >
                          {isSelected ? (
                            <span aria-hidden="true">✓</span>
                          ) : null}
                        </button>
                        <Link
                          href={`/products/${product.id}?categoryId=${product.categoryId}&subCategoryId=${product.subCategoryId}`}
                          className="flex min-w-0 gap-6"
                        >
                          <span className="relative grid size-40 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-surface shadow-[4px_4px_10px_rgb(250_247_243_/_25%)] max-[1400px]:size-[140px]">
                            {showImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={photoSrc!}
                                alt=""
                                className="relative h-auto max-h-[98px] w-14 object-contain"
                                onError={() => {
                                  setFailedImageIds((prev) => {
                                    if (prev.has(product.id)) return prev;
                                    const next = new Set(prev);
                                    next.add(product.id);
                                    return next;
                                  });
                                }}
                              />
                            ) : null}
                          </span>
                          <span className="flex min-w-0 flex-col justify-center gap-2 self-stretch">
                            <span className="overflow-hidden text-xl leading-8 text-ellipsis whitespace-nowrap text-foreground-strong">
                              {product.name}
                            </span>
                            <strong className="text-2xl leading-8 font-bold text-foreground-strong">
                              {formatPrice(product.price)}
                            </strong>
                          </span>
                        </Link>
                        <button
                          type="button"
                          className="absolute top-[18px] right-2.5 grid size-9 place-items-center border-0 bg-transparent p-0 text-snack-black-100 hover:text-foreground-strong"
                          aria-label={`${product.name} 삭제`}
                          onClick={() => handleRemoveOne(product.id)}
                        >
                          <Icon name="close" size="sm" />
                        </button>
                      </div>

                      <div className="flex min-w-0 flex-col items-center justify-center gap-5 border-r border-b border-l border-snack-gray-300 px-2.5 py-6">
                        <div
                          className="flex h-[54px] w-[140px] items-center justify-end gap-1 rounded-2xl border border-snack-orange-300 bg-surface px-3.5 text-lg leading-[26px] text-accent xl:w-40"
                          role="group"
                          aria-label={`${product.name} 수량`}
                        >
                          <span aria-live="polite">{quantity} 개</span>
                          <div className="ml-1 flex flex-col gap-0.5">
                            <button
                              type="button"
                              className="grid h-3.5 w-[18px] place-items-center border-0 bg-transparent p-0 text-snack-orange-300 disabled:cursor-not-allowed disabled:opacity-35"
                              aria-label="수량 증가"
                              disabled={quantity >= MAX_QUANTITY}
                              onClick={() =>
                                changeQuantity(product.id, quantity + 1)
                              }
                            >
                              <Icon
                                name="chevron-up"
                                size="xs"
                                className="!h-3 !w-3"
                              />
                            </button>
                            <button
                              type="button"
                              className="grid h-3.5 w-[18px] place-items-center border-0 bg-transparent p-0 text-snack-orange-300 disabled:cursor-not-allowed disabled:opacity-35"
                              aria-label="수량 감소"
                              disabled={quantity <= 1}
                              onClick={() =>
                                changeQuantity(product.id, quantity - 1)
                              }
                            >
                              <Icon
                                name="chevron-down"
                                size="xs"
                                className="!h-3 !w-3"
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-col items-center justify-center gap-5 border-r border-b border-snack-gray-300 px-2.5 py-6">
                        <strong className="text-center text-2xl leading-8 font-bold text-foreground-strong">
                          {formatPrice(lineTotal)}
                        </strong>
                      </div>

                      <div className="flex min-w-0 flex-col items-center justify-center gap-2 border-b border-snack-gray-300 px-2.5 py-6">
                        <strong className="text-center text-2xl leading-8 font-bold text-foreground-strong">
                          {formatPrice(SHIPPING_FEE)}
                        </strong>
                        <span className="text-xl leading-8 text-snack-black-100">
                          택배 배송
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[20px] border border-border bg-transparent px-4 py-2 text-base leading-[26px] text-foreground-strong hover:border-snack-gray-400 hover:text-snack-black-100 disabled:cursor-not-allowed disabled:opacity-45"
                  onClick={handleClearAll}
                >
                  전체 상품 삭제
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[20px] border border-border bg-transparent px-4 py-2 text-base leading-[26px] text-foreground-strong hover:border-snack-gray-400 hover:text-snack-black-100 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!someSelected}
                  onClick={handleRemoveSelected}
                >
                  선택 상품 삭제
                </button>
              </div>
            </section>

            <aside className="sticky top-6 flex w-full max-w-none flex-col gap-8 max-[1100px]:static max-[1100px]:ml-auto max-[1100px]:max-w-[480px] md:max-[1100px]:max-w-[480px]">
              <div className="flex flex-col gap-6 rounded-2xl border border-border-subtle bg-surface px-5 py-10 shadow-[4px_4px_10px_rgb(250_247_243_/_25%)] md:px-6 md:py-[60px]">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base leading-[26px] font-medium text-snack-black-100">
                      총 주문 상품
                    </span>
                    <strong className="whitespace-nowrap text-2xl leading-8 font-bold text-accent">
                      {selectedProducts.length}
                      <span className="ml-2 font-semibold text-foreground-strong">
                        개
                      </span>
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base leading-[26px] font-medium text-snack-black-100">
                      상품금액
                    </span>
                    <strong className="whitespace-nowrap text-2xl leading-8 font-bold text-foreground-strong">
                      {formatPrice(productTotal)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base leading-[26px] font-medium text-snack-black-100">
                      배송비
                    </span>
                    <strong className="whitespace-nowrap text-2xl leading-8 font-bold text-foreground-strong">
                      {formatPrice(shippingFee)}
                    </strong>
                  </div>
                </div>
                <hr className="m-0 w-full border-0 border-t border-snack-gray-200" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-lg leading-[26px] font-semibold text-snack-black-500">
                    총 주문금액
                  </span>
                  <strong className="whitespace-nowrap text-2xl leading-8 font-bold text-accent">
                    {formatPrice(orderTotal)}
                  </strong>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Link
                  href="/products"
                  className="flex h-16 w-full cursor-pointer items-center justify-center rounded-2xl border-0 bg-background p-4 text-xl leading-8 font-semibold text-accent"
                >
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
