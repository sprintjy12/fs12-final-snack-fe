import Link from "next/link";

import { CommonImage } from "@/components/ui";

const BUBBLES = [
  {
    id: "tl",
    text: "쉽고 빠르게 구매를 요청해보세요",
    positionClass:
      "lg:absolute lg:top-[-9.2%] lg:left-[5.8%] lg:max-w-[min(399px,42vw)]",
  },
  {
    id: "bl",
    text: "내가 원하는 간식을, 원하는 만큼!",
    positionClass:
      "lg:absolute lg:top-[21.3%] lg:left-[-3.9%] lg:max-w-[min(399px,42vw)]",
  },
  {
    id: "tr",
    text: "다양한 품목도 한 눈에 파악해요",
    positionClass:
      "lg:absolute lg:top-[-9.6%] lg:right-[5.8%] lg:max-w-[min(399px,42vw)]",
  },
  {
    id: "br",
    text: "관리자와 유저 모두 이용 가능해요",
    positionClass:
      "lg:absolute lg:top-[21.3%] lg:right-[-3.9%] lg:max-w-[min(399px,42vw)]",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <div className="relative mx-auto box-border min-h-screen w-full max-w-[1920px] px-5 pt-6 pb-[100px] lg:px-[58px] lg:pt-[52px] lg:pb-10">
        <div className="relative z-[2] mb-6 inline-flex items-center gap-4 rounded-[20px] bg-[#555] px-5 py-3 text-base leading-[1.3] font-extrabold text-surface lg:absolute lg:top-[52px] lg:left-[58px] lg:mb-0 lg:px-10 lg:py-5 lg:pr-10 lg:pl-8 lg:text-[clamp(1.25rem,2.5vw,2rem)]">
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

        <div className="mx-auto mt-3 flex w-full max-w-[742px] flex-col items-center gap-6 text-center lg:mt-[108px] lg:gap-12">
+          <h1 className="m-0 w-full">
+            <CommonImage
+              name="logo-landing"
+              size="md"
+              label="Snack"
+              className="h-auto w-full max-w-[504px]"
+            />
+          </h1>
        </div>

        <div className="relative mx-auto mt-6 flex w-full max-w-[1674px] flex-col items-center overflow-visible lg:mt-[clamp(24px,5vw,80px)]">
          <CommonImage
            name="landing-illustration"
            size="md"
            className="block h-auto w-full"
          />

          {BUBBLES.map((bubble) => (
            <div
              key={bubble.id}
              className={[
                "pointer-events-none z-[2] mx-auto my-2 flex w-full max-w-[min(399px,42vw)] flex-col items-center lg:my-0 lg:w-[min(399px,42vw)]",
                bubble.positionClass,
              ].join(" ")}
            >
              <p className="m-0 rounded-full bg-accent px-4 py-3 text-center text-[clamp(0.8125rem,1.2vw,1.375rem)] leading-[1.25] font-bold whitespace-normal text-surface lg:px-7 lg:py-[18px] lg:whitespace-nowrap">
                {bubble.text}
              </p>
              <span
                aria-hidden="true"
                className="h-6 w-8 border-0 bg-[url('/images/cover/bubble-tail.png')] bg-contain bg-center bg-no-repeat"
              />
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-[1640px] flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cover/codeit-logo.svg"
            alt="codeit"
            width={245}
            height={69}
            className="h-auto w-[min(245px,40vw)]"
          />

          <div className="flex flex-wrap items-start justify-end gap-4">
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-[#dfdfdf] bg-surface py-4 pr-7 pl-6 text-[clamp(1rem,1.8vw,1.75rem)] leading-none font-bold text-[#101828]">
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
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-[#dfdfdf] bg-surface py-4 pr-7 pl-6 text-[clamp(1rem,1.8vw,1.75rem)] leading-none font-bold text-[#101828]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/cover/figma-logo.svg"
                alt=""
                width={28}
                height={40}
              />
              <span>Figma</span>
            </div>
          </div>
        </div>

        <Link
          href="/products"
          className="fixed right-4 bottom-6 z-[3] inline-flex min-h-[52px] items-center justify-center rounded-full bg-snack-illustration-600 px-7 py-3 text-base font-bold text-surface shadow-[0_4px_8px_rgb(0_0_0_/_8%),4px_0_10px_rgb(204_204_204_/_12%)] hover:brightness-[0.97] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-foreground lg:absolute lg:right-[58px] lg:bottom-10"
        >
          상품 보러가기
        </Link>
      </div>
    </main>
  );
}
