import type {
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
} from "react";

const iconNames = [
  "close",
  "close-circle",
  "like",
  "chevron-right",
  "chevron-left",
  "chevron-up",
  "chevron-down",
  "visibility",
  "menu",
  "cart",
  "profile",
  "plus",
  "search",
  "kebab-menu",
  "link",
] as const;

const iconKeys = new Set([
  "close-sm",
  "close-md",
  "close-circle-sm",
  "close-circle-md",
  "like-sm-default",
  "like-sm-active",
  "like-md-default",
  "like-md-active",
  "like-lg-default",
  "like-lg-active",
  "chevron-right-xs",
  "chevron-right-sm",
  "chevron-right-sm-thin",
  "chevron-right-md",
  "chevron-left-sm",
  "chevron-left-sm-thin",
  "chevron-left-md",
  "chevron-up-xs",
  "chevron-up-sm",
  "chevron-up-md",
  "chevron-down-xs",
  "chevron-down-sm",
  "chevron-down-md",
  "visibility-on",
  "visibility-off",
  "menu-sm",
  "menu-md",
  "cart-sm",
  "cart-md",
  "cart-outlined-sm",
  "cart-outlined-md",
  "profile-sm",
  "profile-md",
  "plus-sm",
  "plus-md",
  "search-sm",
  "search-md",
  "kebab-menu-sm",
  "kebab-menu-md",
  "link-sm",
  "link-md",
]);

const multicolorIconKeys = new Set([
  "close-circle-sm",
  "close-circle-md",
  "like-sm-default",
  "like-md-default",
  "like-lg-default",
  "profile-sm",
  "profile-md",
  "link-sm",
  "link-md",
]);

const sizeClasses = {
  xs: "size-5",
  sm: "size-6",
  md: "size-9",
  lg: "size-12",
} as const;

export type IconName = (typeof iconNames)[number];
export type IconSize = keyof typeof sizeClasses;
export type IconVariant = "default" | "thin" | "outlined";

type IconProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  name: IconName;
  size?: IconSize;
  variant?: IconVariant;
  active?: boolean;
  label?: string;
};

function getIconKey({
  name,
  size,
  variant,
  active,
}: Required<Pick<IconProps, "name" | "size" | "variant" | "active">>) {
  if (name === "like") {
    return `${name}-${size}-${active ? "active" : "default"}`;
  }

  if (name === "visibility") {
    return `${name}-${active ? "on" : "off"}`;
  }

  if (name === "cart") {
    return `${name}${variant === "outlined" ? "-outlined" : ""}-${size}`;
  }

  if (
    variant === "thin" &&
    (name === "chevron-left" || name === "chevron-right")
  ) {
    return `${name}-${size}-thin`;
  }

  return `${name}-${size}`;
}

export function Icon({
  name,
  size = "sm",
  variant = "default",
  active = false,
  label,
  className,
  style,
  ...props
}: IconProps) {
  const iconKey = getIconKey({ name, size, variant, active });

  if (!iconKeys.has(iconKey)) {
    throw new Error(`지원하지 않는 아이콘 조합입니다: ${iconKey}`);
  }

  const src = `/icons/${iconKey}.svg`;
  const isMulticolor = multicolorIconKeys.has(iconKey);
  const iconStyle = isMulticolor
    ? {
        backgroundImage: `url("${src}")`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
      }
    : {
        backgroundColor: "currentColor",
        maskImage: `url("${src}")`,
        maskPosition: "center",
        maskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskImage: `url("${src}")`,
        WebkitMaskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
      };

  return (
    <span
      {...props}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`${sizeClasses[size]} inline-block shrink-0 ${
        name === "like" && active ? "text-accent" : ""
      } ${className ?? ""}`}
      style={{ ...iconStyle, ...style }}
    />
  );
}

type IconBadgeProps = PropsWithChildren<{
  count: number;
  label?: string;
  className?: string;
  badge?: ReactNode;
}>;

export function IconBadge({
  count,
  label,
  className,
  badge,
  children,
}: IconBadgeProps) {
  const displayCount = count > 99 ? "99+" : count;

  return (
    <span className={`relative inline-flex ${className ?? ""}`}>
      {children}
      {count > 0 ? (
        <span
          aria-label={label ?? `${count}개`}
          className="absolute -right-1 -top-1 inline-flex min-w-3.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] leading-3.5 font-semibold text-surface"
        >
          {badge ?? displayCount}
        </span>
      ) : null}
    </span>
  );
}
