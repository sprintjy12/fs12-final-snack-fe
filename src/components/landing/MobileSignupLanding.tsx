import Link from "next/link";

import { CommonImage, LandingPrompt } from "@/components/ui";

/**
 * Figma 회원가입/Mobile (1:12165, 375×812).
 * 말풍선 좌표는 일러스트(하단 310px) 기준 — 화면 높이가 달라도 강아지와 붙습니다.
 */
const MOBILE_BUBBLES = [
  {
    id: "want",
    text: "내가 원하는 간식을, 원하는 만큼!",
    className: "absolute left-[133px] top-[-113px]",
  },
  {
    id: "role",
    text: "관리자와 유저 모두 이용 가능해요",
    className: "absolute left-[15px] top-[-63px]",
  },
  {
    id: "items",
    text: "다양한 품목도 한 눈에 파악해요",
    className: "absolute left-[214px] top-[-49px]",
  },
  {
    id: "request",
    text: "쉽고 빠르게 구매를 요청해보세요",
    className: "absolute left-[-9px] top-[-9px]",
  },
] as const;

const CTA_CLASS =
  "inline-flex h-[50px] w-full items-center justify-center rounded-full border-2 border-solid border-snack-orange-300 bg-white px-[18px] py-2 text-center text-base leading-[26px] font-bold text-accent";

export function MobileSignupLanding() {
  return (
    <main className="min-h-screen overflow-x-clip bg-background xl:hidden">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[375px] flex-col">
        <header className="flex h-[54px] shrink-0 items-center justify-center bg-accent">
          <CommonImage
            name="logo-text-white"
            size="sm"
            label="Snack"
            className="h-8 w-[126px]"
          />
        </header>

        <div className="mt-[56px] flex flex-col items-center gap-10">
          <h1 className="m-0">
            <CommonImage
              name="logo-landing"
              size="sm"
              label="Snack"
              className="h-12 w-[200px]"
            />
          </h1>

          <div className="flex w-[194px] flex-col items-center gap-2">
            <Link href="/login" className={CTA_CLASS}>
              로그인
            </Link>
            <Link href="/signup/admin" className={CTA_CLASS}>
              관리자 회원가입
            </Link>
          </div>
        </div>

        <div className="relative mt-auto h-[310px] w-full">
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-[310px] w-[670px] -translate-x-1/2 overflow-hidden">
            <CommonImage
              name="landing-illustration"
              size="sm"
              className="size-full"
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
