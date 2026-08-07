import type { ReactNode } from "react";

import {
  CommonImage,
  type CommonImageName,
} from "@/components/ui/CommonImage";

export type EmptyStateImage = Extract<
  CommonImageName,
  "empty-purchase" | "empty-members"
>;

export type EmptyStateProps = {
  "aria-label": string;
  image: EmptyStateImage;
  /** 제목 (회원 없음 등). 없으면 description만 표시 */
  title?: string;
  description: ReactNode;
  className?: string;
  contentClassName?: string;
};

const IMAGE_FRAME_CLASS: Record<EmptyStateImage, string> = {
  "empty-purchase":
    "flex h-[130px] w-[180px] items-center justify-center xl:h-[200px] xl:w-[280px]",
  "empty-members":
    "flex h-[210px] w-[180px] items-center justify-center xl:h-[288px] xl:w-[252px]",
};

const IMAGE_CLASS: Record<EmptyStateImage, string> = {
  "empty-purchase": "block h-auto w-[180px] xl:w-[280px]",
  "empty-members": "block h-auto w-[180px] xl:w-[252px]",
};

/**
 * 빈 목록 안내 (일러스트 + 문구).
 * CommonImage 토큰을 쓰고, 페이지별 여백은 className으로 맞춥니다.
 */
export function EmptyState({
  "aria-label": ariaLabel,
  image,
  title,
  description,
  className,
  contentClassName,
}: EmptyStateProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={["flex justify-center", className].filter(Boolean).join(" ")}
    >
      <div
        className={[
          "flex flex-col items-center gap-6 xl:gap-10",
          contentClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={IMAGE_FRAME_CLASS[image]}>
          <picture>
            <source
              media="(min-width: 1280px)"
              srcSet={`/images/common/${image}-md.svg`}
            />
            <CommonImage
              name={image}
              size="sm"
              className={IMAGE_CLASS[image]}
            />
          </picture>
        </div>

        {title ? (
          <div className="flex w-full flex-col items-center gap-2.5 xl:gap-6">
            <p className="text-lg leading-[26px] font-semibold text-snack-gray-500 xl:text-2xl xl:leading-8">
              {title}
            </p>
            <div className="text-center text-sm leading-6 font-medium text-snack-gray-400 xl:text-xl xl:leading-8">
              {description}
            </div>
          </div>
        ) : (
          <div className="text-center text-sm leading-6 font-medium whitespace-nowrap text-snack-gray-400 xl:text-xl xl:leading-8">
            {description}
          </div>
        )}
      </div>
    </section>
  );
}
