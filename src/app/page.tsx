import Link from "next/link";

import { CommonImage } from "@/components/ui";

/**
 * 데스크톱(xl+)에서만 일러스트 위에 absolute 배치.
 * 태블릿 이하에서는 문서 흐름으로 쌓아 겹침을 피합니다.
 */
const BUBBLES = [
  {
    id: "tl",
    text: "쉽고 빠르게 구매를 요청해보세요",
    positionClass:
      "xl:absolute xl:top-[-9.2%] xl:left-[5.8%] xl:max-w-[min(399px,42vw)]",
  },
  {
    id: "bl",
    text: "내가 원하는 간식을, 원하는 만큼!",
    positionClass:
      "xl:absolute xl:top-[21.3%] xl:left-[-3.9%] xl:max-w-[min(399px,42vw)]",
  },
  {
    id: "tr",
    text: "다양한 품목도 한 눈에 파악해요",
    positionClass:
      "xl:absolute xl:top-[-9.6%] xl:right-[5.8%] xl:max-w-[min(399px,42vw)]",
  },
  {
    id: "br",
    text: "관리자와 유저 모두 이용 가능해요",
    positionClass:
      "xl:absolute xl:top-[21.3%] xl:right-[-3.9%] xl:max-w-[min(399px,42vw)]",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      {/* 상단 바: Snack 워드마크 + (xl+) 로그인/회원가입 텍스트 링크 */}
      <header className="mx-auto flex w-full max-w-[1920px] items-center justify-between px-4 pt-4 sm:px-5 sm:pt-5 md:px-8 xl:px-[58px] xl:pt-8">
        <CommonImage
          name="logo-text"
          size="sm"
          label="Snack"
          className="h-8 w-auto sm:h-9 xl:h-11"
        />
        <nav
          aria-label="계정"
          className="hidden items-center gap-8 xl:flex"
        >
          <Link
            href="/login"
            className="text-lg leading-8 font-bold text-snack-gray-400 hover:text-foreground"
          >
            로그인
          </Link>
          <Link
            href="/signup/admin"
            className="text-lg leading-8 font-bold text-accent hover:brightness-90"
          >
            기업 담당자 회원가입
          </Link>
        </nav>
      </header>

      <div className="relative mx-auto box-border min-h-screen w-full max-w-[1920px] px-4 pt-5 pb-[120px] sm:px-5 sm:pt-6 md:px-8 xl:px-[58px] xl:pt-[52px] xl:pb-[116px]">
        {/* 배지: 모바일·태블릿은 흐름, xl+ absolute */}
        <div className="relative z-[2] mb-4 inline-flex max-w-full items-center gap-3 rounded-[20px] bg-[#555] px-4 py-2.5 text-sm leading-[1.3] font-extrabold text-surface sm:mb-6 sm:gap-4 sm:px-5 sm:py-3 sm:text-base xl:absolute xl:top-[52px] xl:left-[58px] xl:mb-0 xl:px-10 xl:py-5 xl:pr-10 xl:pl-8 xl:text-[clamp(1.25rem,2.5vw,2rem)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cover/badge-notebook.svg"
            alt=""
            width={40}
            height={40}
            className="block size-8 shrink-0 sm:size-10"
          />
          <span>고급 프로젝트</span>
        </div>

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

          {/* 로그인/회원가입: 모바일·태블릿은 알약 버튼, xl+는 상단 헤더에 별도 노출 */}
          <div className="flex w-full max-w-[420px] items-center gap-3 sm:gap-4 xl:hidden">
            <Link
              href="/login"
              className="flex h-12 flex-1 items-center justify-center rounded-full border-2 border-accent bg-surface text-sm font-bold text-accent sm:h-[52px] sm:text-base"
            >
              로그인
            </Link>
            <Link
              href="/signup/admin"
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-accent text-sm font-bold text-surface sm:h-[52px] sm:text-base"
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

          {/* 모바일·태블릿: 2열 그리드 / xl+: 일러스트 위 absolute */}
          <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4 xl:mt-0 xl:contents">
            {BUBBLES.map((bubble) => (
              <div
                key={bubble.id}
                className={[
                  "pointer-events-none z-[2] mx-auto flex w-full max-w-[min(399px,92vw)] flex-col items-center sm:max-w-none xl:my-0 xl:w-[min(399px,42vw)]",
                  bubble.positionClass,
                ].join(" ")}
              >
                <p className="m-0 w-full rounded-full bg-accent px-4 py-2.5 text-center text-[clamp(0.75rem,2.8vw,1.375rem)] leading-[1.3] font-bold break-keep text-surface sm:px-4 sm:py-3 xl:w-auto xl:px-7 xl:py-[18px] xl:whitespace-nowrap">
                  {bubble.text}
                </p>
                <span
                  aria-hidden="true"
                  className="mt-0.5 hidden h-6 w-8 border-0 bg-[url('/images/cover/bubble-tail.png')] bg-contain bg-center bg-no-repeat xl:block"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-6 flex w-full max-w-[1640px] flex-col items-center gap-5 sm:mt-8 sm:gap-6 xl:flex-row xl:items-center xl:justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cover/codeit-logo.svg"
            alt="codeit"
            width={245}
            height={69}
            className="h-auto w-[min(200px,55vw)] sm:w-[min(245px,40vw)]"
          />

          <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4 xl:w-auto xl:justify-end">
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#dfdfdf] bg-surface py-3 pr-5 pl-4 text-[clamp(0.875rem,2.5vw,1.75rem)] leading-none font-bold text-[#101828] sm:gap-2.5 sm:py-4 sm:pr-7 sm:pl-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/cover/uiux-icon.svg"
                alt=""
                width={40}
                height={40}
                className="block size-8 shrink-0 object-contain sm:size-10"
              />
              <span>UI/UX 디자인</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#dfdfdf] bg-surface py-3 pr-5 pl-4 text-[clamp(0.875rem,2.5vw,1.75rem)] leading-none font-bold text-[#101828] sm:gap-2.5 sm:py-4 sm:pr-7 sm:pl-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/cover/figma-logo.svg"
                alt=""
                width={28}
                height={40}
                className="h-8 w-auto sm:h-10"
              />
              <span>Figma</span>
            </div>
          </div>
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
