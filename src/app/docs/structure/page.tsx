"use client";

import { useMemo, useState } from "react";

import styles from "./structure.module.css";

const UPDATED_AT = "2026-08-02";

/**
 * 2026-08-02 기준
 * - 장바구니·구매완료 Tailwind 이전 완료 (module.css 제거)
 * - 구매요청 상세 · 구매내역 취소 = 범위 제외 (X)
 * - 랜딩: 1일 대조 → 2일 쉬운 CSS/카피 → 3일 어려운 배치(Agent)
 * - CTA 유지 · Module 유지 · Tailwind는 나중에
 * - 2일: .tags 시안 대조 결정 반영 (align-items 추가, width:620 미적용)
 */

type PushStatus = "pushed" | "local" | "team" | "guide";

type FolderItem = {
  path: string;
  role: string;
  meta?: string;
  status: PushStatus;
  owner?: "hn" | "team" | "shared";
};

type TabId = "actual" | "compare" | "mine" | "flow" | "cart" | "schedule";

const TABS: { id: TabId; label: string }[] = [
  { id: "actual", label: "실제 구조" },
  { id: "compare", label: "가이드 대비" },
  { id: "mine", label: "내 작업" },
  { id: "flow", label: "유저 플로우" },
  { id: "cart", label: "장바구니 점검" },
  { id: "schedule", label: "일정" },
];

const FOLDERS: FolderItem[] = [
  {
    path: "src/app/products/[id]/",
    role: "상품 상세. 이미지·가격·수량·장바구니 담기.",
    meta: "feature/product-detail 원격. id는 number|string(UUID) 대응 중",
    status: "pushed",
    owner: "hn",
  },
  {
    path: "src/lib/cartStorage.ts",
    role: "장바구니 localStorage. 담기·수량·삭제·검증·저장 실패 처리.",
    meta: "productId: number | string. API 연동 시 교체 stub",
    status: "pushed",
    owner: "hn",
  },
  {
    path: "src/services/productApi.ts",
    role: "상품 목록/상세 API. mock 또는 BE(NEXT_PUBLIC_USE_MOCK).",
    meta: "가이드 src/api 역할. BE 응답 매핑·UUID 대응 로컬 수정",
    status: "local",
    owner: "shared",
  },
  {
    path: "src/api/ + src/api/core/",
    role: "팀 axios 클라이언트·샘플 postApi.",
    meta: "dev에서 들어옴. 상품 API는 아직 services/ 병행",
    status: "team",
    owner: "team",
  },
  {
    path: "src/app/cart/",
    role: "장바구니 목록·수량·선택·삭제·요약.",
    meta: "feature/cart 로컬(rebase). 모달 파일 없음(의도적 제거)",
    status: "local",
    owner: "hn",
  },
  {
    path: "src/app/(private)/purchase/requests/complete/",
    role: "구매요청완료 ①②③ (상품요약·메시지·CTA).",
    meta: "경로 /purchase/requests/* 로 통일. 구경로 redirect 유지",
    status: "local",
    owner: "hn",
  },
  {
    path: "src/components/layout/",
    role: "Header.tsx(단일) + AppHeader. Cart 뱃지 연동.",
    meta: "dev Header 리팩터 + 로컬 뱃지 로직 merge",
    status: "local",
    owner: "hn",
  },
  {
    path: "src/lib/parseOptionalId.ts",
    role: "쿼리 ID 정수 파싱 (trim·정수 패턴·safe integer).",
    meta: "feature/cart 커밋에 포함",
    status: "local",
    owner: "hn",
  },
  {
    path: "src/app/docs/structure/",
    role: "FE 구조·일정 정리용 내부 페이지.",
    meta: "로컬 untracked · /docs/structure",
    status: "local",
    owner: "hn",
  },
  {
    path: "src/app/products/",
    role: "상품 리스트. 정렬·그리드·더보기.",
    meta: "팀 + UUID/실API 어댑터 로컬 수정",
    status: "team",
    owner: "shared",
  },
  {
    path: "src/app/(private)/purchase/",
    role: "구매 요청·구매 내역 관리(팀 라우트).",
    meta: "완료 CTA → /purchase/requests. 상세·내역취소는 범위 제외",
    status: "team",
    owner: "team",
  },
  {
    path: "src/features/products/",
    role: "ProductCard, DUMMY_PRODUCTS 등 도메인 모듈.",
    meta: "가이드에는 없고 레포에 있음",
    status: "team",
    owner: "shared",
  },
  {
    path: "src/components/ui/",
    role: "Modal, Icon, CommonImage…",
    meta: "공통 UI (팀 Modal 등)",
    status: "team",
    owner: "team",
  },
  {
    path: "src/hooks/",
    role: "useProducts 등 TanStack Query 훅.",
    meta: "detail id: number | string",
    status: "team",
    owner: "shared",
  },
];

const COMPARE_ROWS = [
  {
    guide: "src/api/",
    actual: "src/api/ + src/services/",
    note: "팀 apiClient(axios)와 상품 productApi(services) 병행. 통합은 나중에.",
  },
  {
    guide: "src/utils/",
    actual: "src/lib/",
    note: "cartStorage, parseOptionalId, productMedia.",
  },
  {
    guide: "src/schemas/",
    actual: "(거의 없음)",
    note: "Zod는 패키지에 있음. posts-sample 쪽 샘플만. 구매완료는 더미.",
  },
  {
    guide: "src/app/(auth)/",
    actual: "(없음)",
    note: "인증 라우트 미구성.",
  },
  {
    guide: "src/app/admin/, profile/",
    actual: "(없음)",
    note: "아직 페이지 없음. 필요할 때 추가.",
  },
  {
    guide: "—",
    actual: "src/features/",
    note: "상품 카드·더미 등 도메인 단위. 유지해도 됨.",
  },
  {
    guide: "purchase-requests/",
    actual: "(private)/purchase/requests/*",
    note: "완료·내역 모두 /purchase/requests. 구 complete는 redirect.",
  },
];

const FLOW_STEPS = [
  {
    title: "상품 리스트 → 상세",
    body: "app/products → [id] · services/productApi · features/products",
  },
  {
    title: "장바구니 담기",
    body: "상세 CTA → lib/cartStorage · Header AppHeader 뱃지",
  },
  {
    title: "장바구니 확인",
    body: "app/cart — 목록·수량·선택·삭제·요약 (모달 없음)",
  },
  {
    title: "구매요청완료",
    body: "/purchase/requests/complete — ①②③ 시안 UI · 더미 · CTA (완료)",
  },
  {
    title: "랜딩 페이지",
    body: "1일 대조 완료 → 2일 CSS/카피 → 3일 말풍선 배치(Agent). Module·CTA 유지",
  },
];

const CART_STRUCTURE_ROWS = [
  {
    guide: "src/app/cart/",
    actual: "src/app/cart/",
    note: "목록·수량·선택·삭제·요약. PurchaseRequestModal 파일 없음.",
    ok: true,
  },
  {
    guide: "장바구니 데이터",
    actual: "src/lib/cartStorage.ts",
    note: "localStorage stub. UUID id 허용.",
    ok: true,
  },
  {
    guide: "purchase/requests/complete",
    actual: "(private)/purchase/requests/complete (Tailwind)",
    note: "①②③ UI 완료. module.css 없음. 모달→실데이터는 범위 밖.",
    ok: true,
  },
  {
    guide: "Header Cart 뱃지",
    actual: "AppHeader + Header.tsx",
    note: "dev 리팩터 위에 뱃지 로직 유지.",
    ok: true,
  },
];

const CART_REMAINING = [
  {
    title: "① 목록·요약",
    body: "feature/cart 커밋. 동작 QA는 /cart.",
    done: true,
  },
  {
    title: "② 수량·선택·삭제",
    body: "feature/cart 커밋. 로컬 rebase 반영.",
    done: true,
  },
  {
    title: "③ Header 뱃지",
    body: "AppHeader 동기화 반영.",
    done: true,
  },
  {
    title: "구매완료 ①②③",
    body: "로컬 커밋. 더미 UI QA 통과. 실데이터·API는 BE pull 후.",
    done: true,
  },
  {
    title: "구매요청 모달",
    body: "의도적으로 미작업/제거. 이번 주 범위 밖.",
    done: false,
  },
  {
    title: "원격 sync",
    body: "로컬이 origin/feature/cart 와 diverge (rebase). 말할 때만 Push.",
    done: false,
  },
];

const SCHEDULE = [
  {
    period: "1일차 (오늘)",
    title: "[FE] 랜딩 시안 대조",
    body: "Figma 1877:39917 ↔ /. 체크리스트·2·3일 분담 확정.",
    focus: false,
  },
  {
    period: "2일차",
    title: "[FE] 쉬운 CSS/카피",
    body: "완료. Module. 뱃지·태그라인·.tags. CTA·Module 유지.",
    focus: false,
  },
  {
    period: "3일차",
    title: "[FE] 어려운 배치 (Agent)",
    body: "완료. 말풍선 Figma % 맞춤(BR right -3.9%). overflow:visible.",
    focus: false,
  },
  {
    period: "범위 제외 (X)",
    title: "구매요청 상세 · 구매내역 취소",
    body: "이번 구간에서 하지 않음.",
    focus: false,
  },
  {
    period: "이후",
    title: "E2E · sync · 디버그 제거 · 모달/실API",
    body: "플로우 QA → 말할 때 push → agent-debug 제거. 모달·API는 별도.",
    focus: false,
  },
];

/** 지금 포커스 */
const CURRENT_SCOPE = [
  {
    title: "랜딩 1~3일 마무리",
    body: "쉬운 CSS·말풍선 좌표 반영. CTA·Module 유지. 브라우저에서 / 한 번 확인",
  },
  {
    title: "범위 밖 (X)",
    body: "구매요청 상세 · 구매내역 취소 · 요청 모달 · complete 실데이터",
  },
  {
    title: "이미 한 것",
    body: "장바구니 Tailwind · 구매완료 · 랜딩 시안 맞춤",
  },
];

/** 1일차 대조 결과 → 2·3일 분담 (2026-08-02 갱신) */
const LANDING_DAY_PLAN: {
  day: "ok" | "keep" | "d2" | "d3";
  item: string;
  note: string;
}[] = [
  {
    day: "ok",
    item: "배경·로고·태그라인 카피·말풍선 4문장",
    note: "시안과 동일",
  },
  {
    day: "ok",
    item: "뱃지 아이콘·하단 codeit / UI·UX / Figma",
    note: "구성·에셋 일치",
  },
  {
    day: "keep",
    item: "상품 보러가기 CTA",
    note: "시안 없음. 앱 진입용 유지",
  },
  {
    day: "ok",
    item: "CSS Module → Tailwind (.tsx)",
    note: "cart와 동일. page.module.css 제거",
  },
  {
    day: "ok",
    item: ".tags (하단 UI/UX·Figma 묶음)",
    note: "2일 결정 → /docs/cart Tailwind「시안→CSS」탭에 표 정리",
  },
  {
    day: "d2",
    item: "뱃지·태그라인 padding/폰트 미세",
    note: "page.tsx Tailwind. 브라우저에서 시안과 눈대중",
  },
  {
    day: "d2",
    item: "≤1024 스택 레이아웃 간격",
    note: "모바일 gap/padding 다듬기 (쉬운 쪽)",
  },
  {
    day: "ok",
    item: "말풍선 absolute 좌표 (특히 bottomRight)",
    note: "3일 반영. BR right -11%→-3.9%. Figma 좌표 % 정밀화",
  },
  {
    day: "ok",
    item: "히어로 일러스트 ↔ 말풍선 겹침",
    note: "3일. heroVisual overflow:visible + 좌표 맞춤",
  },
];

/** 2일차 .tags 상세 표는 /docs/cart Tailwind「시안→CSS」로 이동 */

/** Figma 1877:39917 vs / 대조 (2026-08-02) */
const LANDING_CHECKLIST: {
  item: string;
  status: "ok" | "gap" | "keep";
  note: string;
}[] = [
  {
    item: "배경 #FDF0DF (background 토큰)",
    status: "ok",
    note: "globals --color-background",
  },
  {
    item: "고급 프로젝트 뱃지 카피",
    status: "ok",
    note: "문구 일치. display는 inline-flex 유지(Figma Flex와 동일 의도)",
  },
  {
    item: "뱃지 아이콘 (노트 아이콘)",
    status: "ok",
    note: "badge-notebook.svg",
  },
  {
    item: "Snack 로고 + 태그라인 문구",
    status: "ok",
    note: "시안 텍스트와 동일",
  },
  {
    item: "말풍선 4개 문구 · 흰 글씨",
    status: "ok",
    note: "BUBBLES + color-surface",
  },
  {
    item: "하단 .tags (UI/UX · Figma)",
    status: "ok",
    note: "flex·gap 16·align-items flex-start. width 620 미적용",
  },
  {
    item: "하단 codeit",
    status: "ok",
    note: "구성 일치",
  },
  {
    item: "상품 보러가기 CTA",
    status: "keep",
    note: "시안엔 없음. 진입용 유지",
  },
  {
    item: "좁은 폭 레이아웃",
    status: "ok",
    note: "≤1024 스택 (의도). 2일 gap만 다듬기",
  },
  {
    item: "말풍선 좌표 · 히어로 겹침",
    status: "ok",
    note: "3일 반영. BR right -3.9% 등 Figma % 맞춤",
  },
];

const STATUS_LABEL: Record<PushStatus, string> = {
  pushed: "Push됨",
  local: "로컬만",
  team: "팀/기존",
  guide: "가이드",
};

const STATUS_CLASS: Record<PushStatus, string> = {
  pushed: styles.badgePushed,
  local: styles.badgeLocal,
  team: styles.badgeTeam,
  guide: styles.badgeGuide,
};

export default function FeStructurePage() {
  const [tab, setTab] = useState<TabId>("actual");
  const [filter, setFilter] = useState<"all" | PushStatus | "hn">("all");

  const folders = useMemo(() => {
    if (filter === "all") return FOLDERS;
    if (filter === "hn") return FOLDERS.filter((item) => item.owner === "hn");
    return FOLDERS.filter((item) => item.status === filter);
  }, [filter]);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className={styles.kicker}>Snack Captain FE</p>
          <h1 className={styles.title}>파일 구조 맵</h1>
          <p className={styles.updated}>
            마지막 업데이트{" "}
            <time dateTime={UPDATED_AT}>{UPDATED_AT}</time>
          </p>
          <p className={styles.lead}>
            팀 가이드 구조와 실제 레포, 로컬/원격 작업을 한 화면에서 구분하는
            정리용 페이지입니다. 서비스 기능과는 별도입니다.
          </p>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="구조 보기">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`${styles.tab} ${tab === item.id ? styles.tabActive : ""}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "actual" ? (
          <section aria-label="실제 폴더 구조">
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={`${styles.badge} ${styles.badgePushed}`}>
                  Push됨
                </span>
                원격에 있는 작업
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.badge} ${styles.badgeLocal}`}>
                  로컬만
                </span>
                커밋/untracked · 원격과 diverge 가능
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.badge} ${styles.badgeTeam}`}>
                  팀/기존
                </span>
                공통·다른 담당 영역
              </span>
            </div>

            <div className={styles.filters}>
              {(
                [
                  ["all", "전체"],
                  ["pushed", "Push됨"],
                  ["local", "로컬만"],
                  ["team", "팀/기존"],
                  ["hn", "내 담당"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.chip} ${filter === id ? styles.chipActive : ""}`}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <h2 className={styles.sectionTitle}>주요 폴더</h2>
            <p className={styles.sectionHint}>
              클릭 필터로 push / 로컬 / 내 담당만 모아볼 수 있습니다.
            </p>
            <div className={styles.grid}>
              {folders.map((item) => (
                <article key={item.path} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <p className={styles.path}>{item.path}</p>
                    <span
                      className={`${styles.badge} ${STATUS_CLASS[item.status]}`}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                  </div>
                  <p className={styles.role}>{item.role}</p>
                  {item.meta ? <p className={styles.meta}>{item.meta}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "compare" ? (
          <section aria-label="가이드와 실제 비교">
            <h2 className={styles.sectionTitle}>팀 가이드 ↔ 현재 레포</h2>
            <p className={styles.sectionHint}>
              문서에 적힌 이상 구조와 실제 경로가 다른 지점입니다. 지금
              리팩터할 필수는 없습니다.
            </p>
            <div className={styles.compare}>
              {COMPARE_ROWS.map((row) => (
                <div key={`${row.guide}-${row.actual}`} className={styles.compareRow}>
                  <div className={styles.compareCol}>
                    <p className={styles.compareLabel}>가이드</p>
                    <p className={styles.compareValue}>{row.guide}</p>
                  </div>
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                  <div className={styles.compareCol}>
                    <p className={styles.compareLabel}>실제</p>
                    <p className={styles.compareValue}>{row.actual}</p>
                    <p className={styles.compareNote}>{row.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "mine" ? (
          <section aria-label="내 작업 범위">
            <h2 className={styles.sectionTitle}>일반 유저 · 상품 영역 (HN)</h2>
            <p className={styles.sectionHint}>
              발표/PR에서 폴더별로 설명할 때 이 카드만 보면 됩니다.
            </p>
            <div className={styles.grid}>
              {FOLDERS.filter((item) => item.owner === "hn").map((item) => (
                <article key={item.path} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <p className={styles.path}>{item.path}</p>
                    <span
                      className={`${styles.badge} ${STATUS_CLASS[item.status]}`}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                  </div>
                  <p className={styles.role}>{item.role}</p>
                  {item.meta ? <p className={styles.meta}>{item.meta}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "flow" ? (
          <section aria-label="유저 플로우">
            <h2 className={styles.sectionTitle}>화면 흐름 ↔ 폴더</h2>
            <p className={styles.sectionHint}>
              사용자가 거치는 순서와 코드 위치가 어떻게 이어지는지입니다.
            </p>
            <div className={styles.flow}>
              {FLOW_STEPS.map((step, index) => (
                <div key={step.title} className={styles.flowStep}>
                  <span className={styles.flowIndex}>{index + 1}</span>
                  <div className={styles.flowBody}>
                    <p className={styles.flowTitle}>{step.title}</p>
                    <p className={styles.meta}>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "cart" ? (
          <section aria-label="장바구니 점검">
            <h2 className={styles.sectionTitle}>1) 폴더 구조 일치</h2>
            <p className={styles.sectionHint}>
              cart / purchase/requests 위치와 실제 레포 대조입니다.
            </p>
            <div className={styles.compare}>
              {CART_STRUCTURE_ROWS.map((row) => (
                <div
                  key={`${row.guide}-${row.actual}`}
                  className={styles.compareRow}
                >
                  <div className={styles.compareCol}>
                    <p className={styles.compareLabel}>가이드</p>
                    <p className={styles.compareValue}>{row.guide}</p>
                  </div>
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                  <div className={styles.compareCol}>
                    <p className={styles.compareLabel}>실제</p>
                    <p className={styles.compareValue}>{row.actual}</p>
                    <p className={styles.compareNote}>{row.note}</p>
                    <span
                      className={`${styles.badge} ${row.ok ? styles.badgePushed : styles.badgeLocal}`}
                    >
                      {row.ok ? "일치" : "확인 필요"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <h2 className={styles.sectionTitle}>2) 잔여 작업</h2>
            <p className={styles.sectionHint}>
              장바구니·완료 기준. 모달·API는 의도적 제외.
            </p>
            <div className={styles.flow}>
              {CART_REMAINING.map((item, index) => (
                <div key={item.title} className={styles.flowStep}>
                  <span className={styles.flowIndex}>{index + 1}</span>
                  <div className={styles.flowBody}>
                    <div className={styles.cardHeader}>
                      <p className={styles.flowTitle}>{item.title}</p>
                      <span
                        className={`${styles.badge} ${item.done ? styles.badgePushed : styles.badgeLocal}`}
                      >
                        {item.done ? "완료" : "남음/제외"}
                      </span>
                    </div>
                    <p className={styles.meta}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className={styles.sectionTitle}>3) 구매완료 QA 체크</h2>
            <p className={styles.sectionHint}>
              실데이터·API는 BE pull 후. 아래는 더미 UI 범위 (2026-08-01 확인).
            </p>
            <div className={styles.flow}>
              <div className={styles.flowStep}>
                <span className={styles.flowIndex}>A</span>
                <div className={styles.flowBody}>
                  <div className={styles.cardHeader}>
                    <p className={styles.flowTitle}>라우트</p>
                    <span className={`${styles.badge} ${styles.badgePushed}`}>
                      통과
                    </span>
                  </div>
                  <p className={styles.meta}>
                    /purchase/requests/complete · CTA → /cart ·
                    /purchase/requests?view=history (전부 200)
                  </p>
                </div>
              </div>
              <div className={styles.flowStep}>
                <span className={styles.flowIndex}>B</span>
                <div className={styles.flowBody}>
                  <div className={styles.cardHeader}>
                    <p className={styles.flowTitle}>화면 (더미)</p>
                    <span className={`${styles.badge} ${styles.badgePushed}`}>
                      통과
                    </span>
                  </div>
                  <p className={styles.meta}>
                    ① 썸네일·외 N개·총액 · ② 요청 메시지 · ③ 버튼 2개
                    (secondary=snack-background-500, sm에서 요청내역
                    order-1)
                  </p>
                </div>
              </div>
              <div className={styles.flowStep}>
                <span className={styles.flowIndex}>C</span>
                <div className={styles.flowBody}>
                  <div className={styles.cardHeader}>
                    <p className={styles.flowTitle}>실데이터 · API</p>
                    <span className={`${styles.badge} ${styles.badgeTeam}`}>
                      추후
                    </span>
                  </div>
                  <p className={styles.meta}>
                    BE pull 후 연동. 모달 제출값·실 요약 교체.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {tab === "schedule" ? (
          <section aria-label="작업 일정">
            <h2 className={styles.sectionTitle}>스프린트 일정 (HN)</h2>
            <p className={styles.sectionHint}>
              지금: 2일차 쉬운 CSS. 제외(X): 구매요청 상세 · 구매내역 취소.
            </p>
            <div className={styles.flow}>
              {SCHEDULE.map((item, index) => (
                <div key={item.period} className={styles.flowStep}>
                  <span className={styles.flowIndex}>{index + 1}</span>
                  <div className={styles.flowBody}>
                    <div className={styles.cardHeader}>
                      <p className={styles.flowTitle}>
                        {item.title}{" "}
                        <span className={styles.meta}>({item.period})</span>
                      </p>
                      {item.focus ? (
                        <span className={`${styles.badge} ${styles.badgeLocal}`}>
                          이번 구간
                        </span>
                      ) : null}
                    </div>
                    <p className={styles.meta}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className={styles.sectionTitle}>지금 범위 메모</h2>
            <p className={styles.sectionHint}>
              확정된 QA/시연 범위와 의도적 제외입니다.
            </p>
            <div className={styles.flow}>
              {CURRENT_SCOPE.map((item, index) => (
                <div key={item.title} className={styles.flowStep}>
                  <span className={styles.flowIndex}>{index + 1}</span>
                  <div className={styles.flowBody}>
                    <p className={styles.flowTitle}>{item.title}</p>
                    <p className={styles.meta}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className={styles.sectionTitle}>랜딩 일차 분담 (1일 대조)</h2>
            <p className={styles.sectionHint}>
              CTA 유지 · Module 유지 · Tailwind는 나중에. 급하지 않게 일차별로.
            </p>
            <div className={styles.flow}>
              {LANDING_DAY_PLAN.map((row, index) => (
                <div key={row.item} className={styles.flowStep}>
                  <span className={styles.flowIndex}>{index + 1}</span>
                  <div className={styles.flowBody}>
                    <div className={styles.cardHeader}>
                      <p className={styles.flowTitle}>{row.item}</p>
                      <span
                        className={`${styles.badge} ${
                          row.day === "ok"
                            ? styles.badgePushed
                            : row.day === "keep"
                              ? styles.badgeTeam
                              : styles.badgeLocal
                        }`}
                      >
                        {row.day === "ok"
                          ? "맞음"
                          : row.day === "keep"
                            ? "유지"
                            : row.day === "d2"
                              ? "2일차"
                              : "3일차"}
                      </span>
                    </div>
                    <p className={styles.meta}>{row.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className={styles.sectionHint}>
              2일차 .tags 시안 대조 표 →{" "}
              <a href="/docs/cart">/docs/cart</a> · Tailwind ·{" "}
              <strong>시안→CSS</strong>
            </p>

            <h2 className={styles.sectionTitle}>랜딩 시안 체크리스트</h2>
            <p className={styles.sectionHint}>
              Figma 프로젝트 표지 1877:39917 ↔ <code>/</code> (
              {UPDATED_AT})
            </p>
            <div className={styles.flow}>
              {LANDING_CHECKLIST.map((row, index) => (
                <div key={row.item} className={styles.flowStep}>
                  <span className={styles.flowIndex}>{index + 1}</span>
                  <div className={styles.flowBody}>
                    <div className={styles.cardHeader}>
                      <p className={styles.flowTitle}>{row.item}</p>
                      <span
                        className={`${styles.badge} ${
                          row.status === "ok"
                            ? styles.badgePushed
                            : row.status === "keep"
                              ? styles.badgeTeam
                              : styles.badgeLocal
                        }`}
                      >
                        {row.status === "ok"
                          ? "맞음"
                          : row.status === "keep"
                            ? "유지"
                            : "어긋남"}
                      </span>
                    </div>
                    <p className={styles.meta}>{row.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <p className={styles.footerNote}>
          경로: <code>/docs/structure</code> · 기능 코드와 분리된 정리용
          페이지입니다. 일정이 바뀌면 이 파일 데이터만 갱신하면 됩니다.
        </p>
      </div>
    </main>
  );
}
