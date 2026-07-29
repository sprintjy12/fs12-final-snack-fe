# fs12-final-snack-fe

코드잇 스프린트 12기 고급 프로젝트 **간식대장** 프론트엔드입니다.

## 시작하기

```bash
npm install
Copy-Item .env.sample .env.local  # Windows PowerShell
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 확인합니다.

## 명령어

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run typecheck`: TypeScript 타입 검사

## 디렉터리 구조

```text
src/
├─ app/                 # 페이지, 레이아웃, 전역 스타일과 Provider
├─ components/common/   # 여러 기능에서 공유하는 UI
├─ features/            # 도메인/기능별 UI와 로직
├─ hooks/               # 공용 React 훅
├─ lib/                 # 외부 라이브러리 설정과 공용 유틸리티
├─ services/            # API 요청 모듈
└─ types/               # 공용 TypeScript 타입
public/                 # 정적 파일
```

기능별 코드는 `src/features/<기능명>` 아래에 컴포넌트, 훅, 타입을 함께 두는 방식을 권장합니다.

## API Example

팀 공통 API 연동 예제는 아래 경로를 참고하세요.

src/app/posts-sample/
