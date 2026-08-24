import Link from "next/link";

import { CommonImage, LandingPrompt } from "@/components/ui";

/**
 * Figma 회원가입/Mobile (1:12165, 375×812) + Tablet (md~lg, xl 미만).
 * 말풍선 좌표는 일러스트(하단) 기준 — 화면 높이가 달라도 강아지와 붙습니다.
 * Desktop(xl+)은 DesktopCover.
 *
 * 375~744 구간: 로고·CTA·일러스트를 clamp로 fluid 스케일 (컨테이너 max-w 375 고정 해제).
 */
const MOBILE_BUBBLES = [
  {
    id: "want",
    text: "내가 원하는 간식을, 원하는 만큼!",
    className:
      "absolute left-[35.5%] top-[-36.5%] md:left-[42%] md:top-[-18%] lg:left-[45%]",
  },
  {
    id: "role",
    text: "관리자와 유저 모두 이용 가능해요",
    className: "absolute left-[4%] top-[-20.3%] md:left-[8%] md:top-[-10%]",
  },
  {
    id: "items",
    text: "다양한 품목도 한 눈에 파악해요",
    className:
      "absolute left-[57.1%] top-[-15.8%] md:left-[62%] md:top-[-8%] lg:left-[68%]",
  },
  {
    id: "request",
    text: "쉽고 빠르게 구매를 요청해보세요",
    className: "absolute left-[-2.4%] top-[-2.9%] md:left-[2%] md:top-[4%]",
  },
] as const;

const CTA_CLASS =
  "inline-flex h-[50px] w-full items-center justify-center rounded-full border-2 border-solid border-snack-orange-300 bg-white px-[18px] py-2 text-center text-base leading-[26px] font-bold text-accent";

const HEADER_LINK_CLASS =
  "text-base leading-7 font-semibold whitespace-nowrap text-surface lg:text-lg";

export function MobileSignupLanding() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-clip bg-background xl:hidden">
      <header className="w-full bg-accent">
        <div className="mx-auto flex h-[54px] w-full max-w-[744px] items-center justify-center px-4 md:h-16 md:max-w-[768px] md:justify-between md:px-8 lg:max-w-[1024px] lg:px-12">
          <Link href="/" aria-label="Snack 홈" className="inline-flex shrink-0">
            <CommonImage
              name="logo-text-white"
              size="sm"
              label="Snack"
              className="h-8 w-[126px]"
            />
          </Link>

          <nav className="hidden md:block" aria-label="인증 메뉴">
            <ul className="flex items-center gap-8 lg:gap-10">
              <li>
                <Link href="/login" className={HEADER_LINK_CLASS}>
                  로그인
                </Link>
              </li>
              <li>
                <Link href="/signup/admin" className={HEADER_LINK_CLASS}>
                  기업 담당자 회원가입
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* max-w 375 고정을 풀어 375~744 구간에서 내용물이 뷰포트에 비례해 커지게 함 */}
      <div className="relative mx-auto flex w-full max-w-[744px] flex-1 flex-col px-4 md:max-w-[768px] md:px-8 lg:max-w-[1024px] lg:px-12">
        <div className="mt-[clamp(56px,15vw,72px)] flex flex-col items-center gap-[clamp(2.5rem,6.5vw,3rem)]">
          <h1 className="m-0">
            <CommonImage
              name="logo-landing"
              size="sm"
              label="Snack"
              className="h-[clamp(3rem,10.3vw,4rem)] w-[clamp(193px,51.5vw,266px)] md:h-16 md:w-[266px]"
            />
          </h1>

          <p className="m-0 box-border hidden w-fit max-w-full items-center justify-center gap-[10px] rounded-full border-2 border-snack-orange-300 bg-surface px-3 py-2 text-center text-base leading-6 font-bold whitespace-nowrap text-accent md:flex">
            흩어진 간식 구매처를 통합하고, 기수별 지출을 똑똑하게 관리하세요
          </p>

          <div className="flex w-[clamp(194px,51.7vw,280px)] flex-col items-center gap-2 md:hidden">
            <Link href="/login" className={CTA_CLASS}>
              로그인
            </Link>
            <Link href="/signup/admin" className={CTA_CLASS}>
              관리자 회원가입
            </Link>
          </div>
        </div>

        {/* 말풍선이 일러스트 위로 음수 offset 배치라, 로고와 겹치지 않을 최소 여백 확보 */}
        <div
          aria-hidden="true"
          className="min-h-[150px] flex-1 md:min-h-[120px]"
        />

        <div className="relative h-[clamp(310px,82.7vw,400px)] w-full overflow-visible md:h-[400px] lg:h-[460px]">
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-[clamp(310px,82.7vw,400px)] w-[clamp(670px,178.7vw,900px)] -translate-x-1/2 md:h-[400px] md:w-[900px] lg:h-[460px] lg:w-[1100px]">
            <CommonImage
              name="landing-illustration"
              size="sm"
              className="size-full object-contain object-bottom"
            />
          </div>

          {MOBILE_BUBBLES.map((bubble) => (
            <LandingPrompt
              key={bubble.id}
              size="sm"
              className={`pointer-events-none z-[1] ${bubble.className}`}
            >
              {bubble.text}
            </LandingPrompt>
          ))}
        </div>
      </div>
    </main>
  );
}