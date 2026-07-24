import type { ComponentPropsWithoutRef } from "react";

const icons = {
  "close-sm": { src: "/icons/close-sm.png", pixels: 24, sizeClass: "size-6" },
  "close-md": { src: "/icons/close-md.png", pixels: 36, sizeClass: "size-9" },
  "close-circle-sm": {
    src: "/icons/close-circle-sm.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "close-circle-md": {
    src: "/icons/close-circle-md.png",
    pixels: 36,
    sizeClass: "size-9",
  },
  "like-sm-default": {
    src: "/icons/like-sm-default.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "like-sm-active": {
    src: "/icons/like-sm-active.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "like-md-default": {
    src: "/icons/like-md-default.png",
    pixels: 36,
    sizeClass: "size-9",
  },
  "like-md-active": {
    src: "/icons/like-md-active.png",
    pixels: 36,
    sizeClass: "size-9",
  },
  "like-lg-default": {
    src: "/icons/like-lg-default.png",
    pixels: 48,
    sizeClass: "size-12",
  },
  "like-lg-active": {
    src: "/icons/like-lg-active.png",
    pixels: 48,
    sizeClass: "size-12",
  },
  "chevron-right-xs": {
    src: "/icons/chevron-right-xs.png",
    pixels: 20,
    sizeClass: "size-5",
  },
  "chevron-right-sm": {
    src: "/icons/chevron-right-sm.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "chevron-right-sm-thin": {
    src: "/icons/chevron-right-sm-thin.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "chevron-right-md": {
    src: "/icons/chevron-right-md.png",
    pixels: 36,
    sizeClass: "size-9",
  },
  "chevron-left-sm": {
    src: "/icons/chevron-left-sm.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "chevron-left-sm-thin": {
    src: "/icons/chevron-left-sm-thin.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "chevron-left-md": {
    src: "/icons/chevron-left-md.png",
    pixels: 36,
    sizeClass: "size-9",
  },
  "chevron-up-xs": {
    src: "/icons/chevron-up-xs.png",
    pixels: 20,
    sizeClass: "size-5",
  },
  "chevron-up-sm": {
    src: "/icons/chevron-up-sm.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "chevron-up-md": {
    src: "/icons/chevron-up-md.png",
    pixels: 36,
    sizeClass: "size-9",
  },
  "chevron-down-xs": {
    src: "/icons/chevron-down-xs.png",
    pixels: 20,
    sizeClass: "size-5",
  },
  "chevron-down-sm": {
    src: "/icons/chevron-down-sm.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "chevron-down-md": {
    src: "/icons/chevron-down-md.png",
    pixels: 36,
    sizeClass: "size-9",
  },
  "visibility-on": {
    src: "/icons/visibility-on.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "visibility-off": {
    src: "/icons/visibility-off.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "menu-sm": { src: "/icons/menu-sm.png", pixels: 24, sizeClass: "size-6" },
  "menu-md": { src: "/icons/menu-md.png", pixels: 36, sizeClass: "size-9" },
  "cart-sm": { src: "/icons/cart-sm.png", pixels: 24, sizeClass: "size-6" },
  "cart-md": { src: "/icons/cart-md.png", pixels: 36, sizeClass: "size-9" },
  "cart-outlined-sm": {
    src: "/icons/cart-outlined-sm.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "cart-outlined-md": {
    src: "/icons/cart-outlined-md.png",
    pixels: 36,
    sizeClass: "size-9",
  },
  "profile-sm": {
    src: "/icons/profile-sm.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "profile-md": {
    src: "/icons/profile-md.png",
    pixels: 36,
    sizeClass: "size-9",
  },
  "plus-sm": { src: "/icons/plus-sm.png", pixels: 24, sizeClass: "size-6" },
  "plus-md": { src: "/icons/plus-md.png", pixels: 36, sizeClass: "size-9" },
  "search-sm": {
    src: "/icons/search-sm.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "search-md": {
    src: "/icons/search-md.png",
    pixels: 36,
    sizeClass: "size-9",
  },
  "kebab-menu-sm": {
    src: "/icons/kebab-menu-sm.png",
    pixels: 24,
    sizeClass: "size-6",
  },
  "kebab-menu-md": {
    src: "/icons/kebab-menu-md.png",
    pixels: 36,
    sizeClass: "size-9",
  },
  "link-sm": { src: "/icons/link-sm.png", pixels: 24, sizeClass: "size-6" },
  "link-md": { src: "/icons/link-md.png", pixels: 36, sizeClass: "size-9" },
} as const;

export type IconName = keyof typeof icons;

type IconProps = Omit<
  ComponentPropsWithoutRef<"img">,
  "alt" | "height" | "src" | "width"
> & {
  name: IconName;
  label?: string;
};

export function Icon({ name, label, className, ...props }: IconProps) {
  const icon = icons[name];

  return (
    <img
      {...props}
      src={icon.src}
      width={icon.pixels}
      height={icon.pixels}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      className={`${icon.sizeClass} shrink-0 object-contain ${className ?? ""}`}
      draggable={false}
    />
  );
}
