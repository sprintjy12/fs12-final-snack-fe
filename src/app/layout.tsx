import type { Metadata } from "next";
import localFont from "next/font/local";

import { Providers } from "@/app/providers";
import { AppHeader } from "@/components/layout/AppHeader";
import "@/app/globals.css";

// next/font/local의 src는 이 파일 기준 상대 경로입니다.
// 그래서 Pretendard 폰트 파일을 app/fonts에 두고 root layout에서 불러옵니다.
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
  weight: "45 920",
});

export const metadata: Metadata = {
  title: "간식대장",
  description: "코드잇 스프린트 12기 고급 프로젝트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <Providers>
          <AppHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
