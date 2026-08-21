import Link from "next/link";

import { CommonImage } from "@/components/ui";

/**
 * 데스크톱(xl+) 커버 (1920 기준 수치, 뷰포트에 맞게 축소).
 * - Snack 로고: 좌우 708px → max 504px
 * - 흰색 CTA: 좌우 589px → max 742px
 * - 상단 최대 160px, 일러스트 최대 792px (한 화면에 잘리지 않게 맞춤)
 */
const BUBBLES = [
  {
    id: "tl",
    text: "쉽고 빠르게 구매를 요청해보세요",
    positionClass: "absolute top-[6%] left-[10%]",
  },
  {
    id: "bl",
    text: "내가 원하는 간식을, 원하는 만큼!",
    positionClass: "absolute top-[34%] left-[4%]",
  },
  {
    id: "tr",
    text: "다양한 품목도 한 눈에 파악해요",
    positionClass: "absolute top-[6%] right-[10%]",
  },
  {
    id: "br",
    text: "관리자와 유저 모두 이용 가능해요",
    positionClass: "absolute top-[34%] right-[4%]",
  },
] as const;

export function DesktopCover() {
  return (
    <main className="hidden h-svh overflow-hidden bg-background xl:flex xl:flex-col">
      <header className="h-[88px] w-full shrink-0 bg-accent">
        <div className="mx-auto flex h-full w-full max-w-[1920px] items-center justify-between px-[120px]">
          <Link
            href="/"
            aria-label="Snack 홈"
            className="inline-flex shrink-0"
          >
            <CommonImage
              name="logo-text-white"
              size="md"
              label="Snack"
              className="h-8 w-auto"
            />
          </Link>

          <nav aria-label="인증 메뉴">
            <ul className="flex items-center gap-10">
              <li>
                <Link
                  href="/login"
                  className="text-xl leading-8 font-semibold whitespace-nowrap text-surface"
                >
                  로그인
                </Link>
              </li>

              <li>
                <Link
                  href="/signup/admin"
                  className="text-xl leading-8 font-semibold whitespace-nowrap text-surface"
                >
                  기업 담당자 회원가입
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 헤더 아래 한 화면에 로고+CTA+일러스트 전부 표시 (스크롤로 잘림 방지) */}
      <div className="relative mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 flex-col items-center overflow-hidden pt-[clamp(40px,6vh,160px)]">
        <h1 className="m-0 w-full max-w-[504px] shrink-0 px-2 text-center">
          <CommonImage
            name="logo-landing"
            size="md"
            label="Snack"
            className="mx-auto h-auto w-full max-w-[504px]"
          />
        </h1>

        <p className="m-0 mt-6 box-border flex w-full max-w-[742px] shrink-0 items-center justify-center rounded-full border-4 border-snack-orange-300 bg-surface px-8 py-4 text-[clamp(1rem,1.35vw,1.5rem)] leading-9 font-bold break-keep text-accent xl:mt-8 xl:py-5">
          흩어진 간식 구매처를 통합하고, 기수별 지출을 똑똑하게 관리하세요
        </p>

        {/* max 792px, 남는 뷰포트만 사용 → 하단이 잘리며 아래로 이어지지 않음 */}
        <div className="relative mx-auto mt-4 min-h-0 w-full max-w-[1674px] flex-1 max-h-[792px]">
          <CommonImage
            name="landing-illustration"
            size="md"
            className="pointer-events-none mx-auto block h-full w-full object-contain object-bottom"
          />

          {BUBBLES.map((bubble) => (
            <div
              key={bubble.id}
              className={[
                "pointer-events-none z-[2] flex max-w-[min(399px,32vw)] flex-col items-center",
                bubble.positionClass,
              ].join(" ")}
            >
              <p className="m-0 w-auto rounded-full bg-accent px-7 py-[18px] text-center text-[clamp(0.95rem,1.25vw,1.5rem)] leading-8 font-bold whitespace-nowrap text-snack-background-500">
                {bubble.text}
              </p>

              <span
                aria-hidden="true"
                className="-mt-px block h-6 w-8 scale-y-[-1] border-0 bg-[url('/images/cover/bubble-tail.svg')] bg-contain bg-center bg-no-repeat"
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
