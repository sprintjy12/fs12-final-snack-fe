type LandingPromptProps = {
  size?: "sm" | "md";
  children?: string;
  className?: string;
};

export function LandingPrompt({
  size = "sm",
  children = "쉽고 빠르게 구매를 요청해보세요",
  className,
}: LandingPromptProps) {
  const isMedium = size === "md";

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        isMedium ? "w-[399px]" : ""
      } ${className ?? ""}`}
    >
      <p
        className={`m-0 whitespace-nowrap rounded-full bg-accent text-background ${
          isMedium
            ? "px-[34px] py-[22px] text-[26px] leading-8 font-bold"
            : "px-3 py-1.5 text-xs leading-5 font-semibold"
        }`}
      >
        {children}
      </p>
      <span
        aria-hidden="true"
        className={
          isMedium
            ? "h-0 w-0 border-x-[16px] border-t-[26px] border-x-transparent border-t-accent"
            : "h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-accent"
        }
      />
    </div>
  );
}
