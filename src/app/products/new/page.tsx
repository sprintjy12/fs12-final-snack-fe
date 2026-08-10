import Link from "next/link";

/** 상품 등록 폼은 판매자 플로우. 라우트만 예약해 [id]와 충돌을 막습니다. */
export default function NewProductPage() {
  return (
    <main className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-surface-muted px-6 py-10">
      <div className="flex max-w-[420px] flex-col items-center gap-3 text-center">
        <h1 className="m-0 text-[28px] leading-10 font-semibold text-foreground-strong">
          상품 등록
        </h1>
        <p className="m-0 text-base leading-[26px] text-foreground">
          상품 등록 기능은 준비 중입니다. 잠시 후 다시 이용해 주세요.
        </p>
        <Link
          href="/products"
          className="mt-3 rounded-2xl bg-accent px-6 py-3 text-lg font-semibold text-surface"
        >
          상품 목록으로
        </Link>
      </div>
    </main>
  );
}
