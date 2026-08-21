"use client";

import { useEffect } from "react";

/**
 * root layout까지 깨질 때용 fallback.
 * root layout을 대체하므로 자체 html/body와 최소 인라인 스타일이 필요합니다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf8f4",
          color: "#373737",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            문제가 발생했어요
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#999999" }}>
            잠시 후 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 8,
              cursor: "pointer",
              border: "1px solid #e6e6e6",
              borderRadius: 12,
              background: "#ffffff",
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              color: "#1f1f1f",
            }}
          >
            다시 시도
          </button>
        </main>
      </body>
    </html>
  );
}
