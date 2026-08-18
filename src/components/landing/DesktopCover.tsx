import Link from "next/link";

import { CommonImage } from "@/components/ui";

/**
 * 데스크톱(xl+)에서만 일러스트 위에 absolute 배치.
 */
const BUBBLES = [
  {
    id: "tl",
    text: "쉽고 빠르게 구매를 요청해보세요",
    positionClass:
      "absolute top-[-9.2%] left-[5.8%] max-w-[min(399px,42vw)]",
  },
  {
    id: "bl",
    text: "내가 원하는 간식을, 원하는 만큼!",
    positionClass:
      "absolute top-[21.3%] left-[-3.9%] max-w-[min(399px,42vw)]",
  },
  {
    id: "tr",
    text: "다양한 품목도 한 눈에 파악해요",
    positionClass:
      "absolute top-[-9.6%] right-[5.8%] max-w-[min(399px,42vw)]",
  },
  {
    id: "br",
    text: "관리자와 유저 모두 이용 가능해요",
    positionClass:
      "absolute top-[21.3%] right-[-3.9%] max-w-[min(399px,42vw)]",
  },
] as const;

export function DesktopCover() {
  return (
    <main className="hidden h-screen overflow-hidden bg-background xl:block">
      <header className="h-[88px] w-full bg-accent">
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

      <div className="relative mx-auto flex h-[calc(100svh-88px)] w-full max-w-[1920px] flex-col overflow-hidden pt-[52px]">
        {/* 로고 + 부제목: 좌우 패딩 적용 */}
        <div className="w-full shrink-0 px-[58px]">
          <div className="mx-auto flex w-full max-w-[742px] flex-col items-center gap-12 text-center">
            <h1 className="m-0 w-full px-2">
              <CommonImage
                name="logo-landing"
                size="md"
                label="Snack"
                className="mx-auto h-auto w-full max-w-[300px]"
              />
            </h1>

            <p className="m-0 box-border flex w-full items-center justify-center rounded-full border-4 border-snack-orange-300 bg-surface px-8 py-5 text-[24px] leading-9 font-bold whitespace-nowrap text-accent">
              흩어진 간식 구매처를 통합하고, 기수별 지출을 똑똑하게 관리하세요
            </p>
          </div>
        </div>

        {/* 일러스트 + 말풍선: 좌우 패딩 미적용 */}
        <div className="relative mx-auto mt-[72px] flex min-h-0 w-full max-w-[1674px] flex-1 flex-col items-center overflow-visible">
          <CommonImage
            name="landing-illustration"
            size="md"
            className="block max-h-full w-full object-contain object-top"
          />

          {BUBBLES.map((bubble) => (
            <div
              key={bubble.id}
              className={[
                "pointer-events-none z-[2] my-0 flex w-[min(399px,42vw)] flex-col items-center",
                bubble.positionClass,
              ].join(" ")}
            >
              <p className="m-0 w-auto rounded-full bg-accent px-7 py-[14px] text-center text-[18px] leading-[1.3] font-bold whitespace-nowrap text-surface">
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
