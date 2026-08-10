import { appendFile, mkdir } from "fs/promises";
import path from "path";

import { getProducts } from "@/services/productApi";

const INGEST =
  "http://127.0.0.1:7749/ingest/c166e136-b910-402d-be7b-bf11edf40f95";

async function writeLog(entry: Record<string, unknown>) {
  const payload = {
    sessionId: "a59c88",
    runId: "qa-server",
    ...entry,
    timestamp: Date.now(),
  };
  const file = path.join(process.cwd(), "..", ".cursor", "debug-a59c88.log");
  await mkdir(path.dirname(file), { recursive: true });
  await appendFile(file, `${JSON.stringify(payload)}\n`, "utf8");
  fetch(INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "a59c88",
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get("categoryId");
  const subCategoryId = url.searchParams.get("subCategoryId");
  const params = {
    sort: (url.searchParams.get("sort") as "latest") || "latest",
    categoryId: categoryId ? Number(categoryId) : undefined,
    subCategoryId: subCategoryId ? Number(subCategoryId) : undefined,
  };

  const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
  const envRaw = process.env.NEXT_PUBLIC_USE_MOCK ?? null;

  try {
    const products = await getProducts(params);
    await writeLog({
      hypothesisId: "A",
      location: "api/_debug/products-qa",
      message: "server getProducts result",
      data: {
        useMock,
        envRaw,
        params,
        count: products.length,
        sampleIds: products.slice(0, 3).map((p) => p.id),
      },
    });
    return Response.json({
      ok: true,
      useMock,
      envRaw,
      count: products.length,
      sampleIds: products.slice(0, 3).map((p) => p.id),
    });
  } catch (error) {
    await writeLog({
      hypothesisId: "B",
      location: "api/_debug/products-qa:error",
      message: "server getProducts threw",
      data: {
        useMock,
        envRaw,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return Response.json(
      {
        ok: false,
        useMock,
        envRaw,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
