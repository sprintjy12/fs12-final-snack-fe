# 🍪 SNACK - Frontend

> 기업 내 간식 구매를 편리하게 관리할 수 있는 사내 간식 구매 관리 서비스

SNACK은 기업 구성원이 간식 상품을 조회하고 장바구니를 통해 구매 요청을 진행하며, 관리자와 최고 관리자가 구매 요청, 예산, 회원 등을 관리할 수 있는 서비스입니다.

---

## 🛠 기술 스택

### Frontend

- React
- Next.js
- TypeScript
- Tailwind CSS
- TanStack Query

### Authentication

- JWT
- Cookie
- Google OAuth

---

## 👥 사용자 권한

| 기능                | 일반 유저 | 관리자 | 최고 관리자 |
| -------------------| :-------: | :----: | :---------: |
| 상품 조회/등록      |    ✅     |   ✅   |     ✅      |
| 상품 수정/삭제      |    ✅     |   ✅   |     ✅      |
| 장바구니            |    ✅     |   ✅   |     ✅      |
| 구매 요청           |    ✅     |   ✅   |     ✅      |
| 즉시 구매           |    ❌     |   ✅   |     ✅      |
| 구매 요청 승인/반려 |    ❌     |   ✅   |     ✅      |
| 조직 구매/지출 조회 |    ❌     |   ✅   |     ✅      |
| 회원 관리           |    ❌     |   ❌   |     ✅      |
| 예산 관리           |    ❌     |   ❌   |     ✅      |
| 기업명 변경         |    ❌     |   ❌   |     ✅      |

---

## ✨ 주요 기능

### 🔐 인증

- 로그인 및 로그아웃
- 초대 이메일을 통한 회원가입
- Google OAuth
- 사용자 권한에 따른 접근 제어

### 🛍️ 상품

- 상품 목록 조회
- 카테고리별 조회
- 최신순 / 판매순 / 가격순 정렬
- 페이지네이션
- 상품 등록
- 내가 등록한 상품 조회
- 관리자 상품 수정 및 삭제

### 🛒 장바구니 & 구매

- 상품 장바구니 추가
- 구매 상품 선택 및 삭제
- 총 주문금액 확인
- 구매 요청
- 구매 요청 취소
- 구매 내역 조회
- 관리자/최고 관리자 즉시 구매
- 예산 부족 시 구매 제한

### 👨‍💼 관리자

- 상품 관리
- 조직 전체 구매 내역 조회
- 구매 지출 및 예산 조회
- 구매 요청 승인/반려
- 즉시 구매

### 👑 최고 관리자

- 회원 목록 및 검색
- 회원 초대
- 회원 탈퇴
- 회원 권한 변경
- 예산 설정 및 수정
- 기업명 변경

---

## 📂 프로젝트 구조

```text
FE 파일구조

├── src/
│   ├── app/                    # Next.js App Router 페이지 및 라우팅
│   │   ├── (auth)/             # 로그인, 회원가입 등 인증 페이지
│   │   ├── products/           # 상품 관련 페이지
│   │   ├── cart/               # 장바구니 페이지
│   │   ├── purchase/           # 구매 내역/요청 관련 페이지
│   │   │   ├── history/
│   │   │   └── requests/
│   │   ├── admin/              # 관리자 및 최고 관리자 페이지
│   │   ├── profile/            # 프로필 페이지
│   │   ├── layout.tsx          # 공통 레이아웃
│   │   └── page.tsx            # 랜딩 페이지
│   │
│   ├── api/                    # 백엔드 API 요청 함수
│   │   └── core/               # 공통 API 요청 설정
│   │
│   ├── components/             # 공통 컴포넌트
│   │   ├── ui/                 # Button, Input, Modal 등
│   │   └── layout/             # Header, Sidebar 등
│   │
│   ├── hooks/                  # 공통 커스텀 훅
│   │   ├── mutation/
│   │   └── queries/
│   ├── lib/                    # 라이브러리 설정
│   ├── schemas/                # Zod 유효성 검사
│   ├── types/                  # TypeScript 타입
│   ├── utils/                  # 공통 유틸 함수
│   └── constants/              # 상수 값
│
├── public/                     # 이미지, 아이콘 등 정적 파일
├── .env
├── next.config.ts
├── tsconfig.json
└── package.json

```

---

## 🔗 API 연동

Backend API와 연동하여 다음 기능을 제공합니다.

- 인증
- 상품
- 장바구니
- 구매 및 구매 요청
- 관리자 기능
- 회원 관리
- 예산 관리

서버 상태 관리는 **TanStack Query**를 사용합니다.

---

## ⚙️ 환경 변수

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
NEXT_PUBLIC_API_URL=
```

---

## 🚀 실행 방법

```bash
git clone [Frontend Repository URL]
cd [Frontend Repository]

npm install
npm run dev
```

환경 변수 설정 후 개발 서버를 실행합니다.
