"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ensureAccessToken } from "@/api/authApi";
import { getOrderDetail } from "@/api/orderApi";
import { Button } from "@/components/ui";

interface OrderSummary {
  productName: string;
  category: string;
  totalQuantity: number;
  totalPrice: number;
  imageSrc: string;
}

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function CartPurchaseCompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";

  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      setImageFailed(false);

      try {
        await ensureAccessToken();
        const response = await getOrderDetail(orderId);
        const detail = response.data;
        const first = detail.items?.[0];

        if (!cancelled) {
          const extraCount = Math.max(0, detail.itemCount - 1);
          setSummary({
            productName: first
              ? extraCount > 0
                ? `${first.productName} 외 ${extraCount}개`
                : first.productName
              : "상품 정보 없음",
            category: first?.categoryName ?? "",
            totalQuantity: detail.totalQuantity,
            totalPrice: detail.totalPrice,
            imageSrc: first?.imageUrl ?? "",
          });
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId, retryKey]);

  // 1. 로딩 중 UI
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-surface-muted text-foreground">
        <p className="py-16 text-center text-foreground-muted">
          주문 정보를 불러오는 중…
        </p>
      </main>
    );
  }

  // 2. 에러 상태 또는 데이터가 없을 때 UI (재시도 버튼 포함)
  if (error || !summary) {
    return (
      <main className="flex min-h-screen flex-col bg-surface-muted text-foreground">
        <section className="flex flex-col items-center gap-4 px-6 pt-20 text-center">
          <h1 className="text-xl font-semibold text-foreground-strong md:text-2xl">
            주문 정보를 불러오지 못했습니다.
          </h1>
          <p className="text-sm text-snack-gray-400">
            네트워크 연결 상태를 확인하고 다시 시도해 주세요.
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" href="/cart">
              장바구니로 돌아가기
            </Button>
            <Button onClick={() => setRetryKey((prev) => prev + 1)}>
              다시 시도
            </Button>
          </div>
        </section>
      </main>
    );
  }

  // 3. 성공 상태 UI (summary가 null이 아님이 보장됨)
  const showImage = Boolean(summary.imageSrc) && !imageFailed;

  return (
    <main className="flex min-h-screen flex-col bg-surface-muted text-foreground">
      <section className="flex flex-col items-center gap-2 px-6 pt-10 md:pt-10 md:pb-4 xl:pt-[120px] xl:pb-10">
        <h1 className="text-xl leading-8 font-semibold text-foreground-strong md:px-2.5 md:py-3.5 md:text-[32px] md:leading-[42px]">
          구매 완료
        </h1>
        <p className="text-center text-sm leading-6 font-normal text-snack-gray-400 md:text-xl md:leading-8">
          성공적으로 구매가 완료되었습니다.
        </p>
      </section>

      <section
        aria-label="구매 상품 정보"
        className="mx-auto flex w-full max-w-[375px] flex-col gap-8 px-6 pt-8 pb-10 md:max-w-none md:gap-8 md:px-6 xl:max-w-[688px] xl:px-6"
      >
        <div className="flex w-full flex-col gap-8">
          <h2 className="text-lg leading-[26px] font-semibold text-foreground-strong md:text-2xl md:leading-8">
            상품정보
          </h2>

          <div className="flex w-full flex-col gap-4 border-y-2 border-border py-6 md:gap-8 md:p-8">
            <div className="flex items-start gap-6">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted shadow-[4px_4px_10px_rgba(250,247,243,0.25)] md:size-[120px]">
                {showImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={summary.imageSrc}
                    alt=""
                    className="size-full object-cover"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <Image
                    src="/images/purchase-history-product.png"
                    alt=""
                    width={94}
                    height={164}
                    className="h-[39px] w-[22px] object-contain md:h-[82px] md:w-[47px]"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-col justify-center gap-0.5 self-stretch">
                <p className="text-sm leading-6 font-medium text-foreground-strong md:text-lg md:leading-[26px]">
                  {summary.productName}
                </p>
                {summary.category ? (
                  <p className="text-xs leading-[18px] text-snack-gray-500 md:text-sm md:leading-6">
                    {summary.category}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex w-full items-center justify-between">
              <p className="text-lg leading-[26px] font-bold text-foreground-strong md:text-2xl md:leading-8">
                총 {summary.totalQuantity}개
              </p>
              <p className="text-xl leading-8 font-bold text-accent md:text-[32px] md:leading-[42px]">
                {formatPrice(summary.totalPrice)}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full flex-col-reverse gap-3 md:w-[640px] md:flex-row md:justify-between md:gap-5">
          <Button
            variant="secondary"
            href="/cart"
            className="w-full md:h-16 md:w-[310px] md:flex-none md:text-xl md:leading-8 xl:w-[310px]"
          >
            장바구니로 돌아가기
          </Button>
          <Button
            href="/purchase/history"
            className="w-full md:h-16 md:w-[310px] md:flex-none md:text-xl md:leading-8 xl:w-[310px]"
          >
            구매 내역 확인하기
          </Button>
        </div>
      </section>
    </main>
  );
}

export default function CartPurchaseCompletePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center bg-surface-muted text-foreground">
          <p className="text-foreground-muted">불러오는 중…</p>
        </main>
      }
    >
      <CartPurchaseCompleteContent />
    </Suspense>
  );
}
