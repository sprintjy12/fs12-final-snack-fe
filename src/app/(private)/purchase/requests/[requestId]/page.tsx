import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/ui";

const navigationItems = [
  { href: "/products", label: "상품 리스트" },
  { href: "/purchase/requests?view=history", label: "구매 요청 내역" },
  { href: "/purchase/requests", label: "구매 요청 관리" },
  { href: "/purchase/history", label: "구매 내역 확인" },
  { href: "/products/mine", label: "상품 등록 내역" },
  { href: "/admin", label: "관리" },
] as const;

const requestedItems = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  category: "청량 ・ 탄산음료",
  name: "코카콜라 제로",
  unitPrice: "2,000원",
  quantity: 4,
  totalPrice: "8,000원",
  discounted: index > 2,
}));

type PurchaseRequestDetailPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

const PurchaseRequestDetailPage = async ({
  params,
}: PurchaseRequestDetailPageProps) => {
  const { requestId } = await params;

  return (
    <main
      className="min-h-screen bg-surface-muted pb-0 text-foreground md:pb-[30px] xl:pb-0"
      data-request-id={requestId}
    >
      <header className="border-b border-border bg-surface-muted">
        <div className="mx-auto flex h-[54px] max-w-[1680px] items-center justify-between px-6 md:h-16 xl:h-[88px] xl:px-0">
          <div className="flex items-center gap-6 xl:gap-16">
            <button
              type="button"
              aria-label="메뉴 열기"
              className="flex size-6 items-center justify-center text-snack-gray-400 xl:hidden"
            >
              <Icon name="menu" size="sm" />
            </button>

            <Link href="/" aria-label="Snack 홈" className="shrink-0">
              <picture>
                <source
                  media="(min-width: 1280px)"
                  srcSet="/images/common/logo-text-md.svg"
                />
                <Image
                  src="/images/common/logo-text-sm.svg"
                  alt="Snack"
                  width={80}
                  height={54}
                  priority
                  className="block h-[54px] w-20 xl:h-[88px] xl:w-[126px]"
                />
              </picture>
            </Link>

            <nav className="hidden xl:block" aria-label="주요 메뉴">
              <ul className="flex items-center gap-10">
                {navigationItems.map((navigation) => (
                  <li key={`${navigation.href}-${navigation.label}`}>
                    <Link
                      href={navigation.href}
                      aria-current={
                        navigation.href === "/purchase/requests?view=history"
                          ? "page"
                          : undefined
                      }
                      className={[
                        "flex h-[88px] items-center whitespace-nowrap px-4 text-xl leading-8 font-bold",
                        navigation.href === "/purchase/requests?view=history"
                          ? "text-accent"
                          : "text-snack-gray-400",
                      ].join(" ")}
                    >
                      {navigation.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-4 xl:gap-12">
            <Link
              href="/cart"
              aria-label="장바구니, 상품 2개"
              className="relative flex items-center text-snack-gray-400 xl:gap-2 xl:px-4"
            >
              <Icon
                name="cart"
                size="sm"
                variant="outlined"
                className="xl:hidden"
              />
              <span className="hidden text-xl leading-8 font-bold text-snack-gray-300 xl:inline">
                Cart
              </span>
              <span className="absolute -top-1.5 -right-1.5 flex min-w-3.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] leading-3.5 font-semibold text-surface xl:static xl:min-w-0 xl:px-3.5 xl:text-xl xl:leading-8 xl:font-bold">
                2
              </span>
            </Link>

            <Link href="/profile" aria-label="프로필" className="xl:px-4">
              <Icon name="profile" size="sm" className="xl:hidden" />
              <span className="hidden text-xl leading-8 font-bold text-snack-gray-300 xl:inline">
                Profile
              </span>
            </Link>

            <button
              type="button"
              className="hidden cursor-pointer bg-transparent text-xl leading-8 font-bold text-snack-gray-300 xl:block xl:px-4"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="border-b border-border px-6 xl:border-0 xl:px-[120px]">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center xl:h-32">
          <h1 className="text-xl leading-8 font-semibold text-foreground-strong md:ml-2.5 xl:text-[32px] xl:leading-[42px]">
            구매 요청 상세
          </h1>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1680px] flex-col md:grid md:max-w-[744px] md:grid-cols-[327px_minmax(0,1fr)] md:gap-[18px] md:pt-6 md:pl-6 xl:max-w-[1680px] xl:grid-cols-[1041px_587px] xl:gap-[52px] xl:pt-0 xl:pl-0">
        <section className="order-1 md:order-2" aria-label="요청 및 예산 정보">
          <div className="flex h-[380px] flex-col px-6 py-6 md:h-[332px] md:py-0 xl:h-[384px] xl:px-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl leading-8 font-semibold text-foreground-strong xl:text-2xl xl:font-bold">
                요청 정보
              </h2>
              <Icon
                name="chevron-up"
                size="sm"
                className="text-snack-gray-400 xl:hidden"
              />
            </div>
            <div className="mt-3 flex flex-1 flex-col gap-3 border-t border-snack-black-100 pt-3 xl:mt-4 xl:gap-4 xl:pt-4">
              <p className="text-sm leading-[26px] text-snack-gray-400 xl:text-xl xl:leading-8">
                2024. 07. 20.
              </p>
              <div>
                <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                  요청인
                </h3>
                <div className="mt-4 flex h-[54px] items-center rounded-2xl border border-border bg-surface-muted px-4 text-sm leading-6 text-foreground-muted xl:h-16 xl:px-6 xl:text-xl xl:leading-8">
                  김스낵
                </div>
              </div>
              <div>
                <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                  요청 메시지
                </h3>
                <div className="mt-4 min-h-[76px] rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm leading-6 text-foreground-muted xl:min-h-20 xl:px-6 xl:py-3.5 xl:text-lg xl:leading-[26px]">
                  <span className="block">코카콜라 제로 인기가 많아요.</span>
                  <span className="block">많이 주문하면 좋을 것 같아요!</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-[440px] flex-col px-6 py-6 md:h-[416px] md:pb-0 xl:mt-4 xl:h-[448px] xl:px-0 xl:py-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl leading-8 font-semibold text-foreground-strong xl:text-2xl xl:font-bold">
                예산 정보
              </h2>
              <Icon
                name="chevron-up"
                size="sm"
                className="text-snack-gray-400 xl:hidden"
              />
            </div>
            <div className="mt-3 flex flex-1 flex-col gap-6 border-t border-snack-black-100 pt-3 xl:mt-4 xl:gap-4 xl:pt-4">
              {[
                ["이번 달 지출액", "1,500,000원"],
                ["이번 달 남은 예산", "3,500,000원"],
                ["구매 후 예산", "1,460,000원"],
              ].map(([label, value], index) => (
                <div key={label}>
                  <h3 className="text-sm leading-[26px] font-semibold text-foreground-strong xl:text-xl xl:leading-8">
                    {label}
                  </h3>
                  <div
                    className={[
                      "mt-4 flex h-[54px] items-center rounded-2xl border border-border bg-surface-muted px-4 text-sm leading-6 xl:h-16 xl:px-6 xl:text-xl xl:leading-8",
                      index === 2
                        ? "font-medium text-snack-black-300"
                        : "text-foreground-muted",
                    ].join(" ")}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="order-2 px-6 md:order-1 md:px-0"
          aria-label="요청 품목"
        >
          <h2 className="text-xl leading-8 font-semibold text-foreground-strong xl:text-2xl xl:font-bold">
            요청 품목
          </h2>
          <div className="mt-4 h-[480px] overflow-y-auto rounded-2xl border border-snack-black-100 bg-surface p-6 shadow-[4px_4px_20px_rgba(250,247,243,0.25)] [scrollbar-color:var(--snack-gray-400)_transparent] [scrollbar-width:thin] md:h-[612px] xl:mt-6 xl:h-[582px] xl:p-10">
            <ul className="space-y-6">
              {requestedItems.map((product) => (
                <li
                  key={product.id}
                  className="border-b border-border pb-2 xl:pb-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 xl:gap-4">
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted shadow-[4px_4px_10px_rgba(250,247,243,0.25)] xl:size-20">
                        <Image
                          src="/images/purchase-history-product.png"
                          alt=""
                          width={28}
                          height={49}
                          className="h-[39px] w-[22px] object-contain xl:h-[49px] xl:w-7"
                        />
                      </div>
                      <div>
                        <p className="text-xs leading-[18px] text-foreground-muted xl:text-sm xl:leading-6">
                          {product.category}
                        </p>
                        <p className="text-sm leading-6 font-medium text-foreground-strong xl:text-lg xl:leading-[26px]">
                          {product.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-[78px] flex-col items-end justify-center">
                      {product.discounted ? (
                        <p className="flex gap-1 text-sm leading-5">
                          <span className="text-danger">5%</span>
                          <span className="text-foreground-muted line-through">
                            1,900원
                          </span>
                        </p>
                      ) : null}
                      <p className="text-sm leading-6 font-semibold text-foreground-strong xl:text-lg xl:leading-[26px]">
                        {product.unitPrice}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-foreground-strong xl:mt-4">
                    <p className="text-[13px] leading-[22px] font-medium xl:text-base xl:leading-[26px]">
                      수량: {product.quantity}개
                    </p>
                    <p className="text-lg leading-[26px] font-bold xl:text-2xl xl:leading-8">
                      {product.totalPrice}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex items-center justify-end gap-4 whitespace-nowrap xl:mt-0 xl:py-4">
            <span className="text-base leading-[26px] font-semibold text-foreground-strong xl:text-2xl xl:leading-8">
              총 24건
            </span>
            <strong className="text-2xl leading-8 text-accent xl:text-[32px] xl:leading-[42px]">
              240,000원
            </strong>
          </div>

          <div className="mt-8 flex w-full gap-3 md:mt-16 md:w-[696px] md:gap-5 xl:mt-6 xl:w-full xl:gap-[23px]">
            <button
              type="button"
              className="flex h-[54px] flex-1 cursor-pointer items-center justify-center rounded-2xl bg-snack-background-300 p-4 text-sm leading-6 font-semibold text-foreground-muted xl:h-16 xl:text-xl xl:leading-8"
            >
              요청 반려
            </button>
            <button
              type="button"
              className="flex h-[54px] flex-1 cursor-pointer items-center justify-center rounded-2xl bg-accent p-4 text-sm leading-6 font-semibold text-surface xl:h-16 xl:text-xl xl:leading-8"
            >
              요청 승인
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PurchaseRequestDetailPage;
