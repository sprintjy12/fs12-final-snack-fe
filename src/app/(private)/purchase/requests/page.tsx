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

const purchaseRequests = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  requestedAt: "2024. 07. 04",
  productName: "코카콜라 제로 외 1건",
  quantity: 4,
  amount: "21,000",
  requester: "김스낵",
}));

const paginationItems = ["1", "2", "3", "4", "5", "more", "9"] as const;

type PurchaseRequestsPageProps = {
  searchParams: Promise<{
    empty?: string;
  }>;
};

const PurchaseRequestsPage = async ({
  searchParams,
}: PurchaseRequestsPageProps) => {
  const { empty } = await searchParams;
  const visiblePurchaseRequests = empty === "true" ? [] : purchaseRequests;
  const hasPurchaseRequests = visiblePurchaseRequests.length > 0;

  return (
    <main className="min-h-screen bg-surface-muted pb-20 text-foreground">
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
                        navigation.href === "/purchase/requests"
                          ? "page"
                          : undefined
                      }
                      className={[
                        "flex h-[88px] items-center whitespace-nowrap px-4 text-xl leading-8 font-bold",
                        navigation.href === "/purchase/requests"
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
        <div className="mx-auto flex h-16 max-w-[1680px] items-center xl:h-36">
          <h1 className="text-xl leading-8 font-semibold text-foreground-strong md:ml-2.5 xl:text-[32px] xl:leading-[42px]">
            구매 요청 관리
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1680px]">
        <section className="flex h-16 items-center justify-end border-b-2 border-border px-6 xl:h-[66px] xl:border-0 xl:px-0">
          <label className="relative block">
            <span className="sr-only">구매 요청 정렬</span>
            <select className="h-9 w-[87px] appearance-none rounded-lg border border-snack-gray-200 bg-surface py-1.5 pr-7 pl-2 text-sm leading-6 font-normal text-foreground-muted outline-none focus:border-accent xl:h-[50px] xl:w-[136px] xl:px-3.5 xl:pr-10 xl:text-lg xl:leading-[26px]">
              <option>최신순</option>
              <option>오래된순</option>
            </select>
            <Icon
              name="chevron-down"
              size="xs"
              className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-snack-gray-400 xl:right-3"
            />
          </label>
        </section>

        <section
          aria-label="구매 요청 목록"
          className={hasPurchaseRequests ? undefined : "hidden"}
        >
          <div className="hidden xl:block">
            <div className="grid h-20 grid-cols-[207px_1fr_219px_219px_219px] items-center rounded-full border border-snack-gray-200 bg-surface px-20 text-center text-xl leading-8 font-medium text-snack-black-100">
              <span>구매요청일</span>
              <span>상품정보</span>
              <span>주문 금액</span>
              <span>요청인</span>
              <span>비고</span>
            </div>

            <ul className="mt-4">
              {visiblePurchaseRequests.map((request) => (
                <li
                  key={request.id}
                  className="grid h-[104px] grid-cols-[207px_1fr_219px_219px_219px] items-center border-b border-border px-20 text-center text-xl leading-8 text-snack-black-100"
                >
                  <span>{request.requestedAt}</span>
                  <div className="text-left">
                    <p className="font-semibold text-snack-black-200">
                      {request.productName}
                    </p>
                    <p className="text-sm leading-6 font-medium text-foreground-muted">
                      총 수량: {request.quantity}개
                    </p>
                  </div>
                  <span>{request.amount}</span>
                  <span>{request.requester}</span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      className="h-11 w-[94px] rounded-lg bg-snack-background-300 text-lg leading-[26px] font-semibold text-foreground-muted"
                    >
                      반려
                    </button>
                    <button
                      type="button"
                      className="h-11 w-[94px] rounded-lg bg-accent text-lg leading-[26px] font-semibold text-surface"
                    >
                      승인
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <ul className="xl:hidden">
            {visiblePurchaseRequests.slice(0, 3).map((request) => (
              <li
                key={request.id}
                className="h-[280px] border-b-2 border-border px-6 pt-6 pb-6"
              >
                <div className="flex h-[100px] gap-4">
                  <div className="flex size-[100px] shrink-0 items-center justify-center rounded-lg border border-border bg-surface shadow-[4px_4px_10px_rgba(250,247,243,0.25)]">
                    <Image
                      src="/images/purchase-history-product.png"
                      alt=""
                      width={28}
                      height={49}
                      className="h-[49px] w-7 object-contain"
                    />
                  </div>
                  <div className="flex w-[211px] min-w-0 flex-none flex-col justify-between">
                    <div>
                      <p className="text-sm leading-6 text-foreground-strong">
                        {request.productName}
                      </p>
                      <p className="text-xs leading-[18px] text-foreground-muted">
                        총 수량: {request.quantity}개
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="h-[34px] flex-1 rounded-lg bg-snack-background-300 text-[13px] leading-[22px] font-semibold text-foreground-muted"
                      >
                        반려
                      </button>
                      <button
                        type="button"
                        className="h-[34px] flex-1 rounded-lg bg-accent text-[13px] leading-[22px] font-semibold text-surface"
                      >
                        승인
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-b border-snack-gray-200 py-3 text-sm leading-6 font-semibold text-foreground-strong">
                  <span>주문금액</span>
                  <span>{request.amount}원</span>
                </div>

                <dl className="mt-3 space-y-2 text-sm leading-6 text-foreground-muted">
                  <div className="flex items-center justify-between">
                    <dt>구매요청일</dt>
                    <dd className="font-medium">{request.requestedAt}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>요청인</dt>
                    <dd className="font-medium">{request.requester}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </section>

        {!hasPurchaseRequests ? (
          <section
            aria-label="구매 요청 없음"
            className="flex justify-center pt-16 md:pt-40 xl:pt-[179px]"
          >
            <div className="flex h-[202px] w-[327px] flex-col items-center gap-6 xl:h-[304px] xl:w-[388px] xl:gap-10">
              <div className="flex h-[130px] w-[180px] items-center justify-center xl:h-[200px] xl:w-[280px]">
                <picture>
                  <source
                    media="(min-width: 1280px)"
                    srcSet="/images/common/empty-purchase-md.svg"
                  />
                  <Image
                    src="/images/common/empty-purchase-sm.svg"
                    alt=""
                    width={180}
                    height={130}
                    className="block h-auto w-[180px] xl:w-[280px]"
                  />
                </picture>
              </div>
              <p className="text-center text-sm leading-6 font-medium whitespace-nowrap text-snack-gray-400 xl:text-xl xl:leading-8">
                <span className="block">요청받은 내역이 없어요</span>
                <span className="block">
                  상품 리스트를 둘러보고 제품을 담아보세요!
                </span>
              </p>
            </div>
          </section>
        ) : null}

        <nav
          aria-label="구매 요청 페이지"
          className={[
            "mt-4 items-center justify-center gap-2 py-2 md:mt-8 md:py-0 xl:mt-[298px] xl:gap-2.5",
            hasPurchaseRequests ? "flex" : "hidden",
          ].join(" ")}
        >
          <button
            type="button"
            aria-label="이전 페이지"
            disabled
            className="flex size-[34px] items-center justify-center rounded-md text-snack-gray-300 disabled:cursor-not-allowed xl:size-12 xl:rounded-lg"
          >
            <Icon name="chevron-left" size="sm" />
          </button>

          <div className="flex items-center gap-1">
            {paginationItems.map((page) =>
              page === "more" ? (
                <span
                  key={page}
                  aria-hidden="true"
                  className="flex size-[34px] items-center justify-center text-snack-gray-300 xl:size-12"
                >
                  ···
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  aria-current={page === "1" ? "page" : undefined}
                  className={[
                    "flex size-[34px] items-center justify-center rounded-md text-base leading-[26px] xl:size-12 xl:rounded-lg xl:text-lg",
                    page === "1"
                      ? "font-semibold text-foreground-strong"
                      : "font-medium text-snack-gray-300 xl:font-normal",
                    page === "4" || page === "5" ? "hidden xl:flex" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {page}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            aria-label="다음 페이지"
            className="flex size-[34px] items-center justify-center rounded-md text-foreground-strong xl:size-12 xl:rounded-lg"
          >
            <Icon name="chevron-right" size="sm" />
          </button>
        </nav>
      </div>
    </main>
  );
};

export default PurchaseRequestsPage;
