import type { ComponentPropsWithoutRef } from "react";

const commonImages = {
  "social-google": {
    sm: { src: "/images/common/social-google-sm.svg", width: 54, height: 54 },
    md: { src: "/images/common/social-google-md.svg", width: 72, height: 72 },
  },
  "social-kakao": {
    sm: { src: "/images/common/social-kakao-sm.svg", width: 54, height: 54 },
    md: { src: "/images/common/social-kakao-md.svg", width: 72, height: 72 },
  },
  "social-naver": {
    sm: { src: "/images/common/social-naver-sm.svg", width: 54, height: 54 },
    md: { src: "/images/common/social-naver-md.svg", width: 72, height: 72 },
  },
  "logo-text": {
    sm: { src: "/images/common/logo-text-sm.svg", width: 80, height: 54 },
    md: { src: "/images/common/logo-text-md.svg", width: 126, height: 88 },
  },
  "logo-landing": {
    sm: { src: "/images/common/logo-landing-sm.svg", width: 200, height: 48 },
    md: { src: "/images/common/logo-landing-md.svg", width: 504, height: 128 },
  },
  "empty-purchase": {
    sm: {
      src: "/images/common/empty-purchase-sm.svg",
      width: 180,
      height: 130,
    },
    md: {
      src: "/images/common/empty-purchase-md.svg",
      width: 280,
      height: 200,
    },
  },
  "empty-members": {
    sm: {
      src: "/images/common/empty-members-sm.svg",
      width: 180,
      height: 210,
    },
    md: {
      src: "/images/common/empty-members-md.svg",
      width: 252,
      height: 288,
    },
  },
  "landing-illustration": {
    sm: {
      src: "/images/common/landing-illustration-sm.svg",
      width: 670,
      height: 310,
    },
    md: {
      src: "/images/common/landing-illustration-md.svg",
      width: 1674,
      height: 564,
    },
  },
} as const;

export type CommonImageName = keyof typeof commonImages;
export type CommonImageSize = "sm" | "md";

type CommonImageProps = Omit<
  ComponentPropsWithoutRef<"img">,
  "alt" | "height" | "src" | "width"
> & {
  name: CommonImageName;
  size?: CommonImageSize;
  label?: string;
};

export function CommonImage({
  name,
  size = "sm",
  label,
  className,
  ...props
}: CommonImageProps) {
  const image = commonImages[name][size];

  return (
    <img
      {...props}
      src={image.src}
      width={image.width}
      height={image.height}
      alt={label ?? ""}
      className={`block h-auto max-w-full object-contain ${className ?? ""}`}
      draggable={false}
    />
  );
}
