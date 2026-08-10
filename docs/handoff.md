# 작업 인수인계 (handoff)

새 Cursor 채팅을 열면 이전 대화가 자동으로 이어지지 않습니다.  
이 파일을 첨부하거나 내용을 붙여넣어 주세요.

## 프로젝트

- 앱 루트: `fs12-final-snack-fe` (`d:\snack-captain-fe\fs12-final-snack-fe`)
- 스택: Next.js App Router, TypeScript, CSS Modules, TanStack Query
- 스타일: Figma 토큰 일부 (`--accent`, `--background-400` 등). Tailwind는 아직 미도입

## 일정 (이틀 = 1페이지)

| 구간 | 페이지 | 상태 |
|------|--------|------|
| Day 1–2 | 상품 리스트 마무리 | 진행 중 (다듬기) |
| Day 3–4 | 상품 상세 `/products/[id]` | 대기 |
| Day 5–6 | 장바구니 `/cart` | 대기 |
| Day 7–8 | 구매 요청 완료 | 대기 |
| Day 9–10 | 내 구매 요청 내역 | 대기 |
| Day 11–12 | 구매 요청 상세 | 대기 |
| Day 13–14 | 상품 등록 내역 | 대기 |

담당: 일반 유저 · 상품 영역 (유저 플로우 5→6→7→8→9→10→16)

## 완료된 것

### 공통 컴포넌트

- `components/ui`: Button (Figma outlined CTA 반영), Input, Modal
- `components/layout`: Header, Sidebar, AppShell (`showSidebar={false}` 일반 유저)

### 상품 리스트

- `/products` — 카테고리·정렬·카드 그리드·빈 상태·스켈레톤
- `ProductCard` — Figma `Card/상품리스트` 기준
- mock API: `services/productApi.ts`, `hooks/useProducts.ts`
- `NEXT_PUBLIC_USE_MOCK=true` (기본). `false`면 실 API 호출

### 기타

- 홈(`/`) → **상품 보러가기** → `/products`
- 타입검사 `npm run typecheck` 통과 확인함

## 데이터 스키마 (현재 기준)

### 카테고리

```json
[
  { "id": 1, "name": "스낵" },
  { "id": 2, "name": "음료" },
  { "id": 3, "name": "생수" },
  { "id": 4, "name": "간편식" },
  { "id": 5, "name": "신선식품" },
  { "id": 6, "name": "비품" }
]
```

### 상품

```ts
{
  id: number;
  name: string;
  price: number;
  url: string;       // 구매 링크
  photo: string;     // 이미지 파일명
  categoryId: number;
  subCategoryId: number;
  purchaseCount?: number; // 시안 뱃지용(옵션)
}
```

- 소분류(`subCategory`) 목록 JSON은 아직 없음
- 상품 이미지는 나중에 첨부. 지금은 placeholder

## 주의

- 커밋/푸시 아직 안 함 (로컬만). 원격에는 공통 컴포넌트 코드 없음
- 바깥 `snack-captain-fe` 루트 설정 파일은 정리함. 실제 앱은 `fs12-final-snack-fe`만 사용
- Git Bash에서 `node` 안 보이면:
  ```bash
  export PATH="/c/Program Files/nodejs:$PATH"
  ```

## 로컬 실행

```bash
cd /d/snack-captain-fe/fs12-final-snack-fe
npm install
cp .env.sample .env.local
npm run dev
```

- 리스트: http://localhost:3000/products

## 다음

1. 상품 리스트 다듬기 마무리 (이미지·시안 추가 시 반영)
2. Day 3–4 상품 상세 + 장바구니 담기 CTA
