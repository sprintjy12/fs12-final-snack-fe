import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_URL,
  // 백엔드가 응답하지 않는 경우 요청이 무한정 대기하지 않도록
  // 공통 timeout을 설정합니다.
  // 파일 업로드처럼 오래 걸리는 요청은
  // 요청별 timeout 옵션으로 재정의할 수 있습니다.
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});
