import { appendFile, mkdir } from "fs/promises";
import path from "path";

const INGEST =
  "http://127.0.0.1:7749/ingest/c166e136-b910-402d-be7b-bf11edf40f95";

function logPath() {
  return path.join(process.cwd(), "..", ".cursor", "debug-a59c88.log");
}

export async function POST(request: Request) {
  const payload = await request.json();
  const entry = {
    sessionId: "a59c88",
    ...payload,
    timestamp: payload.timestamp ?? Date.now(),
  };
  const line = `${JSON.stringify(entry)}\n`;
  const file = logPath();
  await mkdir(path.dirname(file), { recursive: true });
  await appendFile(file, line, "utf8");

  fetch(INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "a59c88",
    },
    body: JSON.stringify(entry),
  }).catch(() => {});

  return Response.json({ ok: true });
}
