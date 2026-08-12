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
    <main className="hidden min-h-screen overflow-x-hidden bg-background xl:block">
      <div className="relative mx-auto box-border min-h-screen w-full max-w-[1920px] px-[58px] pt-[52px] pb-[116px]">
        <div className="absolute top-[52px] left-[58px] z-[2] inline-flex items-center gap-4 rounded-[20px] bg-[#555] px-10 py-5 pr-10 pl-8 text-[clamp(1.25rem,2.5vw,2rem)] leading-[1.3] font-extrabold text-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cover/badge-notebook.svg"
            alt=""
            width={40}
            height={40}
            className="block size-10 shrink-0"
          />
          <span>고급 프로젝트</span>
        </div>

        <div className="mx-auto mt-[108px] flex w-full max-w-[742px] flex-col items-center gap-12 text-center">
          <h1 className="m-0 w-full px-2">
            <CommonImage
              name="logo-landing"
              size="md"
              label="Snack"
              className="mx-auto h-auto w-full max-w-[min(504px,78vw)]"
            />
          </h1>
          <p className="m-0 box-border flex w-full items-center justify-center rounded-full border-4 border-snack-orange-300 bg-surface px-8 py-5 text-[clamp(0.8125rem,3.2vw,1.625rem)] leading-[1.25] font-bold break-keep text-accent">
            흩어진 간식 구매처를 통합하고, 기수별 지출을 똑똑하게 관리하세요
          </p>
        </div>

        <div className="relative mx-auto mt-[clamp(24px,5vw,80px)] flex w-full max-w-[1674px] flex-col items-center overflow-visible">
          <CommonImage
            name="landing-illustration"
            size="md"
            className="block h-auto w-full"
          />

          {BUBBLES.map((bubble) => (
            <div
              key={bubble.id}
              className={[
                "pointer-events-none z-[2] my-0 flex w-[min(399px,42vw)] flex-col items-center",
                bubble.positionClass,
              ].join(" ")}
            >
              <p className="m-0 w-auto rounded-full bg-accent px-7 py-[18px] text-center text-[clamp(0.75rem,2.8vw,1.375rem)] leading-[1.3] font-bold whitespace-nowrap text-surface">
                {bubble.text}
              </p>
              <span
                aria-hidden="true"
                className="mt-0.5 block h-6 w-8 border-0 bg-[url('/images/cover/bubble-tail.png')] bg-contain bg-center bg-no-repeat"
              />
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-[1640px] flex-row items-center justify-between gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cover/codeit-logo.svg"
            alt="codeit"
            width={245}
            height={69}
            className="h-auto w-[min(245px,40vw)]"
          />

          <div className="flex w-auto flex-wrap items-center justify-end gap-4">
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-[#dfdfdf] bg-surface py-4 pr-7 pl-6 text-[clamp(0.875rem,2.5vw,1.75rem)] leading-none font-bold text-[#101828]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/cover/uiux-icon.svg"
                alt=""
                width={40}
                height={40}
                className="block size-10 shrink-0 object-contain"
              />
              <span>UI/UX 디자인</span>
            </div>
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-[#dfdfdf] bg-surface py-4 pr-7 pl-6 text-[clamp(0.875rem,2.5vw,1.75rem)] leading-none font-bold text-[#101828]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/cover/figma-logo.svg"
                alt=""
                width={28}
                height={40}
                className="h-10 w-auto"
              />
              <span>Figma</span>
            </div>
          </div>
        </div>

        <Link
          href="/products"
          className="absolute right-[58px] bottom-10 z-[3] inline-flex min-h-[52px] items-center justify-center rounded-full bg-snack-illustration-600 px-7 py-3 text-base font-bold text-surface shadow-[0_4px_8px_rgb(0_0_0_/_8%),4px_0_10px_rgb(204_204_204_/_12%)] hover:brightness-[0.97] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-foreground"
        >
          상품 보러가기
        </Link>
      </div>
    </main>
  );
}
