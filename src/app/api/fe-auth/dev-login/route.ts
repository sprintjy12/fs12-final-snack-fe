import { NextResponse } from "next/server";

/**
 * 로그인 UI 연동 전용 로컬 헬퍼.
 * DEV_LOGIN_EMAIL / DEV_LOGIN_PASSWORD로 백엔드 로그인을 대신 호출합니다.
 * development 이외(production/test/staging 등)에서는 404로 차단합니다.
 */
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, message: "Not Found" },
      { status: 404 },
    );
  }

  const email = process.env.DEV_LOGIN_EMAIL;
  const password = process.env.DEV_LOGIN_PASSWORD;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  if (!email || !password) {
    return NextResponse.json(
      {
        success: false,
        message:
          "DEV_LOGIN_EMAIL / DEV_LOGIN_PASSWORD가 .env에 없습니다. 로그인 페이지 연동 전 로컬 전용입니다.",
      },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await response.json().catch(() => null)) as {
      message?: string;
      code?: string;
    } | null;

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          code: data?.code,
          message:
            data?.message ??
            `백엔드 로그인 실패 (HTTP ${response.status}). API 서버(.env · DB)를 확인하세요.`,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: `백엔드 로그인 요청에 실패했습니다.`,
      },
      { status: 502 },
    );
  }
}
