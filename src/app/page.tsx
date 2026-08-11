import Link from "next/link";

import { CommonImage } from "@/components/ui";

/** 모든 화면 크기에서 일러스트 위에 absolute 배치합니다. */
const BUBBLES = [
  {
    id: "tl",
    text: "쉽고 빠르게 구매를 요청해보세요",
    positionClass: "top-[-9.2%] left-[5.8%]",
  },
  {
    id: "bl",
    text: "내가 원하는 간식을, 원하는 만큼!",
    positionClass: "top-[21.3%] left-[-3.9%]",
  },
  {
    id: "tr",
    text: "다양한 품목도 한 눈에 파악해요",
    positionClass: "top-[-9.6%] right-[5.8%]",
  },
  {
    id: "br",
    text: "관리자와 유저 모두 이용 가능해요",
    positionClass: "top-[21.3%] right-[-3.9%]",
  },
] as const;

export default function HomePage() {
  return (
    <main className="overflow-x-hidden bg-background">
      <header className="w-full bg-accent">
        <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-4 sm:px-5 md:h-20 md:px-8 xl:h-[100px] xl:px-[120px]">
          <Link href="/" aria-label="Snack 홈" className="shrink-0">
            <CommonImage
              name="logo-text-white"
              size="sm"
              label="Snack"
              className="h-7 w-auto sm:h-8 xl:h-9"
            />
          </Link>

          <nav aria-label="인증 메뉴" className="hidden sm:block">
            <ul className="flex items-center gap-10">
              <li>
                <Link
                  href="/login"
                  className="text-lg font-semibold whitespace-nowrap text-surface"
                >
                  로그인
                </Link>
              </li>
              <li>
                <Link
                  href="/signup/admin"
                  className="text-lg font-semibold whitespace-nowrap text-surface"
                >
                  기업 담당자 회원가입
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="relative mx-auto box-border w-full max-w-[1920px] px-4 pt-5 pb-[120px] sm:px-5 sm:pt-6 md:px-8 xl:px-[58px] xl:pt-[52px] xl:pb-[116px]">
        <div className="mx-auto mt-2 flex w-full max-w-[742px] flex-col items-center gap-4 text-center sm:mt-3 sm:gap-6 xl:mt-[108px] xl:gap-12">
          <h1 className="m-0 w-full px-2">
            <CommonImage
              name="logo-landing"
              size="md"
              label="Snack"
              className="mx-auto h-auto w-full max-w-[min(504px,78vw)]"
            />
          </h1>
          <p className="m-0 box-border flex w-full items-center justify-center rounded-full border-[3px] border-snack-orange-300 bg-surface px-3.5 py-3 text-[clamp(0.8125rem,3.2vw,1.625rem)] leading-[1.35] font-bold break-keep text-accent sm:px-[18px] sm:py-3.5 sm:leading-[1.25] xl:border-4 xl:px-8 xl:py-5">
            흩어진 간식 구매처를 통합하고, 기수별 지출을 똑똑하게 관리하세요
          </p>

          {/* 모바일 전용 인증 CTA. sm+에서는 헤더의 인라인 링크를 사용합니다. */}
          <div className="flex w-full max-w-[343px] flex-col gap-2.5 sm:hidden">
            <Link
              href="/login"
              className="flex h-[50px] w-full items-center justify-center rounded-full border-2 border-snack-orange-300 bg-snack-gray-50 text-base font-bold text-accent"
            >
              로그인
            </Link>
            <Link
              href="/signup/admin"
              className="flex h-[50px] w-full items-center justify-center rounded-full border-2 border-snack-orange-300 bg-snack-gray-50 text-base font-bold text-accent"
            >
              관리자 회원가입
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-5 flex w-full max-w-[1674px] flex-col items-center overflow-visible sm:mt-6 xl:mt-[clamp(24px,5vw,80px)]">
          <CommonImage
            name="landing-illustration"
            size="md"
            className="block h-auto w-full"
          />

          {BUBBLES.map((bubble) => (
            <div
              key={bubble.id}
              className={[
                "pointer-events-none absolute z-[2] flex w-[min(399px,42vw)] flex-col items-center",
                bubble.positionClass,
              ].join(" ")}
            >
              <p className="m-0 w-auto rounded-full bg-accent px-3 py-2 text-center text-[clamp(0.625rem,2.3vw,1.375rem)] leading-[1.3] font-bold break-keep text-surface sm:whitespace-nowrap xl:px-7 xl:py-[18px]">
                {bubble.text}
              </p>
              <span
                aria-hidden="true"
                className="mt-0.5 block h-6 w-8 rotate-180 border-0 bg-[url('/images/cover/bubble-tail.svg')] bg-contain bg-center bg-no-repeat"
              />
            </div>
          ))}
        </div>

        <Link
          href="/products"
          className="fixed right-4 bottom-5 z-[3] inline-flex min-h-12 items-center justify-center rounded-full bg-snack-illustration-600 px-5 py-2.5 text-sm font-bold text-surface shadow-[0_4px_8px_rgb(0_0_0_/_8%),4px_0_10px_rgb(204_204_204_/_12%)] hover:brightness-[0.97] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-foreground sm:right-4 sm:bottom-6 sm:min-h-[52px] sm:px-7 sm:py-3 sm:text-base xl:absolute xl:right-[58px] xl:bottom-10"
        >
          상품 보러가기
        </Link>
      </div>
    </main>
  );
}
