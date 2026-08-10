"use client";

import Link from "next/link";
import { useState } from "react";

import styles from "./cartDocs.module.css";

type AreaId = "cart" | "complete" | "tailwind";

type CartSectionId =
  | "map"
  | "storage"
  | "page"
  | "badge"
  | "media"
  | "detail";

type CompleteSectionId = "map" | "page";

type TailwindSectionId =
  | "basics"
  | "size"
  | "color"
  | "display"
  | "responsive"
  | "spacing"
  | "figma"
  | "examples";

type LineNote = {
  line: number | string;
  code: string;
  note: string;
};

const AREAS: { id: AreaId; label: string; href: string | null }[] = [
  { id: "cart", label: "장바구니", href: "/cart" },
  {
    id: "complete",
    label: "구매완료",
    href: "/purchase/requests/complete",
  },
  { id: "tailwind", label: "Tailwind", href: null },
];

const CART_SECTIONS: { id: CartSectionId; label: string }[] = [
  { id: "map", label: "전체 지도" },
  { id: "storage", label: "cartStorage" },
  { id: "page", label: "cart/page" },
  { id: "badge", label: "AppHeader" },
  { id: "media", label: "productMedia" },
  { id: "detail", label: "상세 담기" },
];

const COMPLETE_SECTIONS: { id: CompleteSectionId; label: string }[] = [
  { id: "map", label: "전체 지도" },
  { id: "page", label: "complete/page" },
];

const TAILWIND_SECTIONS: { id: TailwindSectionId; label: string }[] = [
  { id: "basics", label: "기본 사용법" },
  { id: "size", label: "사이즈" },
  { id: "color", label: "색상 (팀 토큰)" },
  { id: "display", label: "디스플레이" },
  { id: "responsive", label: "반응형" },
  { id: "spacing", label: "여백" },
  { id: "figma", label: "시안→CSS" },
  { id: "examples", label: "우리 코드 예시" },
];

/** 랜딩 2일: Figma Badges ↔ .tags (표 형식) */
const LANDING_TAGS_COMPARE: {
  prop: string;
  figma: string;
  code: string;
  verdict: "ok" | "added" | "skip" | "optional";
  note: string;
}[] = [
  {
    prop: "display",
    figma: "flex (가로/세로로 아이템 배치)",
    code: "flex (가로/세로로 아이템 배치)",
    verdict: "ok",
    note: "일치. (.badge는 inline-flex — Figma Flex와 혼동 금지)",
  },
  {
    prop: "gap",
    figma: "16px",
    code: "16px",
    verdict: "ok",
    note: "일치",
  },
  {
    prop: "align-items",
    figma: "flex-start (교차축 시작 = 위쪽 맞춤)",
    code: "flex-start (교차축 시작 = 위쪽 맞춤)",
    verdict: "added",
    note: "추가함. 태그 높이 달라도 위 정렬",
  },
  {
    prop: "width",
    figma: "620px",
    code: "(없음) + justify-content: flex-end (아이템을 오른쪽으로 붙임)",
    verdict: "skip",
    note: "고정 620 비추 — 좁은 화면 깨짐. width 빼고 flex-end 유지",
  },
  {
    prop: "flex-shrink",
    figma: "0",
    code: "(없음)",
    verdict: "optional",
    note: "데스크톱만 넣어도 됨. 모바일 @media에서 풀기",
  },
  {
    prop: "flex-wrap / justify",
    figma: "(시안 단수 행)",
    code: "wrap + flex-end (공간 부족하면 다음 줄로 줄바꿈 + 아이템을 오른쪽으로 붙임)",
    verdict: "ok",
    note: "반응형용 유지",
  },
];

const TEAM_COLOR_TOKENS: { utility: string; meaning: string }[] = [
  { utility: "bg-surface / text-surface", meaning: "흰 면 (#fff). 주황 버튼 위 글자" },
  { utility: "bg-surface-muted", meaning: "크림 페이지 배경 (#fbf8f4)" },
  { utility: "bg-background", meaning: "snack-background-500 (#fdf0df). 보조 CTA" },
  { utility: "bg-snack-background-500", meaning: "위와 동일 계열. 완료 secondary 버튼" },
  { utility: "bg-accent / text-accent", meaning: "주황 (#f97b22)" },
  { utility: "bg-accent-subtle", meaning: "연한 주황 (#fef3eb). 완료 secondary엔 쓰지 않음" },
  { utility: "text-foreground-strong", meaning: "본문 강조 글자" },
  { utility: "text-foreground-muted", meaning: "보조 글자·카테고리" },
  { utility: "border-border", meaning: "기본 보더" },
  { utility: "border-snack-gray-300", meaning: "테이블 구분선 등" },
  { utility: "text-snack-black-100", meaning: "중간 회색 텍스트" },
];

const STORAGE_LINES: LineNote[] = [
  {
    line: 1,
    code: `export const CART_STORAGE_KEY = "snack-captain-cart";`,
    note: "localStorage에 넣을 키 이름. 이 문자열로 읽고 씀.",
  },
  {
    line: 2,
    code: `export const CART_CHANGE_EVENT = "snack-captain-cart-change";`,
    note: "같은 탭에서 헤더 뱃지에게 “바뀌었어”라고 알리는 커스텀 이벤트 이름.",
  },
  {
    line: "3–4",
    code: `MIN_QUANTITY = 1 / MAX_QUANTITY = 999`,
    note: "수량 하한·상한. 검증과 정규화에 공통으로 씀.",
  },
  {
    line: "7–10",
    code: `type CartItem = { productId: number | string; quantity: number }`,
    note: "장바구니에 실제로 저장하는 형태. 이름·가격은 없음. UUID 대비로 id는 string도 허용.",
  },
  {
    line: "12–14",
    code: `isPositiveInteger(value)`,
    note: "양의 정수인지 타입 가드. productId가 number일 때 사용.",
  },
  {
    line: "16–19",
    code: `isValidProductId(value)`,
    note: "number(양의 정수) 또는 비어 있지 않은 string이면 OK.",
  },
  {
    line: "25–29",
    code: `normalizeQuantity(value)`,
    note: "유한 수를 내림한 뒤 1~999로 클램프. 이상하면 null.",
  },
  {
    line: "31–41",
    code: `isValidCartItem(value)`,
    note: "JSON에서 꺼낸 한 줄이 CartItem 형태인지 검사. 깨진 데이터는 걸러냄.",
  },
  {
    line: "43–45",
    code: `canUseStorage()`,
    note: "브라우저인지 + localStorage 있는지. SSR(서버)에서는 false → 빈 배열.",
  },
  {
    line: "47–50",
    code: `notifyCartChange()`,
    note: "CART_CHANGE_EVENT를 window에 dispatch. AppHeader가 듣고 뱃지 갱신.",
  },
  {
    line: "53–63",
    code: `saveCartItems(items)`,
    note: "JSON.stringify 후 setItem. 성공 시 notify. 쿼터 초과 등은 catch → false.",
  },
  {
    line: "65–77",
    code: `getCartItems()`,
    note: "getItem → JSON.parse → 배열만 → isValidCartItem 필터. 실패 시 [].",
  },
  {
    line: "79–81",
    code: `getCartItemCount()`,
    note: "모든 item.quantity 합. 헤더 뱃지 숫자.",
  },
  {
    line: "84–110",
    code: `addToCart(productId, quantity)`,
    note: "이미 있으면 수량 더함(상한 999). 없으면 push. 저장 성공 여부 boolean.",
  },
  {
    line: "113–129",
    code: `setCartQuantity(productId, quantity)`,
    note: "수량을 절대값으로 교체. 실패·잘못된 id면 기존 목록 그대로 반환.",
  },
  {
    line: "132–137",
    code: `removeFromCart(productId)`,
    note: "해당 id 한 줄 삭제. 저장 실패 시 기존 목록 반환.",
  },
  {
    line: "140–148",
    code: `removeFromCartMany(productIds)`,
    note: "선택 삭제. Set으로 모아 filter.",
  },
  {
    line: "151–154",
    code: `clearCart()`,
    note: "빈 배열로 저장. 전체 삭제 버튼.",
  },
];

const PAGE_LINES: LineNote[] = [
  {
    line: 1,
    code: `"use client";`,
    note: "클라이언트 컴포넌트. useState/useEffect·localStorage 때문에 필요.",
  },
  {
    line: "3–4",
    code: `import Link … / useEffect, useMemo, useState`,
    note: "라우팅 링크 + React 훅.",
  },
  {
    line: "6–7",
    code: `CommonImage, Icon / DUMMY_PRODUCTS`,
    note: "UI 아이콘·빈 상태 이미지 / 지금 상품 상세 데이터 소스(더미).",
  },
  {
    line: "8–15",
    code: `from "@/lib/cartStorage"`,
    note: "저장소 API. 목록 읽고 수량·삭제할 때 전부 여기로.",
  },
  {
    line: 16,
    code: `getProductPhotoSrc from productMedia`,
    note: "photo 파일명 → 실제 img src.",
  },
  {
    line: 17,
    code: `import type { Product }`,
    note: "타입만. 번들 JS에는 안 들어감. CartProduct 정의용.",
  },
  {
    line: 19,
    code: `(이전) import styles from "./cart.module.css"`,
    note: "지금은 삭제됨. budget/Header처럼 page.tsx className에 Tailwind 유틸로 작성. globals.css는 토큰만.",
  },
  {
    line: "21–22",
    code: `SHIPPING_FEE = 3000 / MAX_QUANTITY = 999`,
    note: "화면용 상수. (storage에도 999 상한 있음)",
  },
  {
    line: "24–26",
    code: `type CartProduct = CartItem & { product: Product }`,
    note: "저장 한 줄 + 상품 정보를 합친 화면용 타입.",
  },
  {
    line: 28,
    code: `type ProductId = CartItem["productId"]`,
    note: "id 타입을 한곳에서. number | string.",
  },
  {
    line: "30–32",
    code: `formatPrice(price)`,
    note: "1234 → \"1,234원\".",
  },
  {
    line: 35,
    code: `useState<CartItem[]>([])`,
    note: "화면에 그릴 장바구니 원본(ID·수량).",
  },
  {
    line: 36,
    code: `useState selectedIds`,
    note: "체크박스로 고른 상품 id 목록.",
  },
  {
    line: 37,
    code: `useState hydrated false`,
    note: "마운트 전에 localStorage 읽기 전. 로딩 UI 구분.",
  },
  {
    line: "38–40",
    code: `failedImageIds Set`,
    note: "썸네일 onError 난 id. 다시 안 그리게.",
  },
  {
    line: "42–47",
    code: `useEffect → getCartItems → setState → hydrated true`,
    note: "브라우저에서만 storage 읽기. 처음엔 전부 선택 상태로.",
  },
  {
    line: "49–58",
    code: `cartProducts = useMemo flatMap + DUMMY find`,
    note: "ID로 더미 상품 찾아 붙임. 상품 없으면 그 줄은 버림(flatMap []).",
  },
  {
    line: "60–62",
    code: `selectedProducts = filter selectedIds`,
    note: "합계·선택 삭제에 쓰는 “고른 것만”.",
  },
  {
    line: "63–65",
    code: `allSelected / someSelected`,
    note: "전체선택 체크·삭제 버튼 disabled 여부.",
  },
  {
    line: "67–72",
    code: `productTotal / shippingFee / orderTotal`,
    note: "선택분 금액 + (선택 있으면) 배송비 3000.",
  },
  {
    line: "74–79",
    code: `syncCart(next)`,
    note: "storage가 준 최신 배열로 state 갱신 + 사라진 id는 선택에서도 제거.",
  },
  {
    line: "81–87",
    code: `handleToggleSelectAll`,
    note: "전부 선택돼 있으면 비우고, 아니면 전부 넣음.",
  },
  {
    line: "89–95",
    code: `handleToggleSelect(productId)`,
    note: "한 줄 체크 토글.",
  },
  {
    line: "97–99",
    code: `handleChangeQuantity → setCartQuantity → syncCart`,
    note: "storage에 쓰고 돌아온 배열로 UI 동기화.",
  },
  {
    line: "101–112",
    code: `handleRemoveOne / Selected / ClearAll`,
    note: "삭제계열도 전부 syncCart로 맞춤.",
  },
  {
    line: "121–125",
    code: `!hydrated ? 로딩`,
    note: "storage 읽기 전 깜빡임 방지.",
  },
  {
    line: "125–139",
    code: `cartProducts.length === 0 ? empty`,
    note: "빈 장바구니 UI + /products 링크.",
  },
  {
    line: "164–169",
    code: `map → photoSrc, lineTotal, isSelected`,
    note: "행마다 이미지·줄금액·선택 여부 계산.",
  },
  {
    line: "239–256",
    code: `수량 + / − 버튼 → handleChangeQuantity`,
    note: "1 미만·999 초과는 disabled.",
  },
  {
    line: "283–298",
    code: `전체 삭제 / 선택 삭제`,
    note: "listActionButton. 선택 삭제는 someSelected 없을 때 disabled.",
  },
  {
    line: "302–325",
    code: `summary 카드`,
    note: "총 개수·상품금액·배송비·총 주문금액 표시.",
  },
];

const BADGE_LINES: LineNote[] = [
  {
    line: 1,
    code: `"use client";`,
    note: "경로·이벤트 리스너 쓰므로 클라이언트.",
  },
  {
    line: "7–11",
    code: `CART_CHANGE_EVENT, CART_STORAGE_KEY, getCartItemCount`,
    note: "뱃지 숫자 + 언제 다시 읽을지.",
  },
  {
    line: "13–14",
    code: `HeaderWithCartCount / useState(0)`,
    note: "헤더에 넘길 cartCount 상태. 처음 0.",
  },
  {
    line: "16–18",
    code: `syncCount = () => setCartCount(getCartItemCount())`,
    note: "storage에서 합계 다시 읽어 state에 반영.",
  },
  {
    line: 18,
    code: `syncCount();`,
    note: "마운트 직후 한 번 동기화.",
  },
  {
    line: "20–24",
    code: `onStorage: key가 CART이거나 null이면 sync`,
    note: "다른 탭에서 localStorage 바뀐 경우. (같은 탭 storage 이벤트는 보통 안 옴)",
  },
  {
    line: "26–27",
    code: `addEventListener CHANGE + storage`,
    note: "같은 탭은 커스텀 이벤트, 다른 탭은 storage.",
  },
  {
    line: "28–31",
    code: `return () => removeEventListener`,
    note: "언마운트 시 정리. 메모리 누수 방지.",
  },
  {
    line: 34,
    code: `return <Header cartCount={cartCount} />`,
    note: "실제 뱃지 UI는 Header(Tailwind)가 그림.",
  },
  {
    line: "38–45",
    code: `AppHeader: / · 샘플이면 null`,
    note: "표지·modal/toast 샘플에선 헤더 숨김.",
  },
  {
    line: "47–50",
    code: `Suspense + HeaderWithCartCount`,
    note: "Header가 useSearchParams 쓰므로 Suspense로 감쌈.",
  },
];

const MEDIA_LINES: LineNote[] = [
  {
    line: 1,
    code: `/** photo 파일명 → 실제 이미지 경로 … */`,
    note: "주석. CDN 정해지면 base URL만 바꾸면 됨.",
  },
  {
    line: 2,
    code: `export function getProductPhotoSrc(photo: string)`,
    note: "진입 함수. cart·상세·카드가 공유.",
  },
  {
    line: 3,
    code: `if (!photo) return null;`,
    note: "빈 문자열이면 이미지 없음.",
  },
  {
    line: "4–6",
    code: `http(s)면 그대로 return`,
    note: "이미 절대 URL이면 가공 안 함.",
  },
  {
    line: 7,
    code: `NEXT_PUBLIC_IMAGE_BASE_URL … replace(/\\/$/, "")`,
    note: "환경변수 base. 끝 슬래시 제거.",
  },
  {
    line: "8–10",
    code: `if (base) return \`\${base}/\${photo}\``,
    note: "CDN/S3 쓸 때.",
  },
  {
    line: 11,
    code: `return \`/products/\${photo}\``,
    note: "기본: public/products/ 아래 파일.",
  },
];

const DETAIL_LINES: LineNote[] = [
  {
    line: 9,
    code: `import { addToCart } from "@/lib/cartStorage"`,
    note: "상세에서 담기할 때 쓰는 함수.",
  },
  {
    line: "85–87",
    code: `handleAddToCart: if (!product) return; saved = addToCart(...)`,
    note: "상품 로드된 뒤에만. id + 화면 수량을 storage에 저장.",
  },
  {
    line: "88–93",
    code: `saved 성공 → success feedback`,
    note: "addToCart가 true면 안내 문구.",
  },
  {
    line: "95–99",
    code: `실패 → error feedback`,
    note: "storage 막힘 등. 사용자에게 설정 확인 안내.",
  },
  {
    line: "(연결)",
    code: `saveCartItems 성공 시 notifyCartChange()`,
    note: "그 순간 AppHeader syncCount → 뱃지 숫자 증가.",
  },
];

const COMPLETE_LINES: LineNote[] = [
  {
    line: 1,
    code: `"use client";`,
    note: "클라이언트 컴포넌트. useState(이미지 실패) 때문에 필요.",
  },
  {
    line: 3,
    code: `import Link from "next/link"`,
    note: "CTA를 페이지 이동 링크로 씀 (/cart, /purchase/requests).",
  },
  {
    line: 4,
    code: `import { useState } from "react"`,
    note: "썸네일 로드 실패 플래그용.",
  },
  {
    line: 6,
    code: `import { getProductPhotoSrc } from "@/lib/productMedia"`,
    note: "더미 photo 파일명 → /products/... URL. 장바구니와 같은 헬퍼.",
  },
  {
    line: 8,
    code: `(이전) import styles from "./complete.module.css"`,
    note: "삭제됨. cart와 같이 page.tsx className에 Tailwind. globals.css 토큰만 사용.",
  },
  {
    line: "10–18",
    code: `COMPLETE_SUMMARY = { name, extraCount, totalCount, … }`,
    note: "시안용 더미 상품 요약. 모달/API 붙이면 이 자리를 실데이터로 교체.",
  },
  {
    line: "20–25",
    code: `COMPLETE_REQUEST_LINES = [ "…", "…" ]`,
    note: "시안용 요청 메시지 줄들. 나중에 모달 제출 텍스트로 교체.",
  },
  {
    line: "27–29",
    code: `formatPrice(price)`,
    note: "43000 → \"43,000원\". cart와 같은 패턴.",
  },
  {
    line: "30–33",
    code: `formatProductLabel(name, extraCount)`,
    note: "extraCount>0 이면 \"코카콜라 제로 외 8개\". 0이면 이름만.",
  },
  {
    line: "36–38",
    code: `imageFailed / photoSrc / showImage`,
    note: "이미지 URL 만들고, onError 나면 썸네일 숨김.",
  },
  {
    line: "41–43",
    code: `<main> <div className={panel}> <h1>상품정보`,
    note: "① 섹션 제목. 페이지 뼈대 시작.",
  },
  {
    line: "45–48",
    code: `<section contentSection aria-label="구매 요청 요약">`,
    note: "상품+합계+메시지를 한 테두리 블록 안에 묶음 (시안 구조).",
  },
  {
    line: "49–71",
    code: `productRow: thumb + name + category`,
    note: "① 상품 요약. showImage일 때만 <img>.",
  },
  {
    line: "57–58",
    code: `onError={() => setImageFailed(true)}`,
    note: "깨진 이미지면 빈 썸네일 박스만 남김.",
  },
  {
    line: "74–81",
    code: `totals: 총 N개 + formatPrice(amount)`,
    note: "① 총 개수·총 금액. 금액은 accent 색(CSS).",
  },
  {
    line: 83,
    code: `<hr className={styles.divider} />`,
    note: "상품 요약과 요청 메시지 사이 구분선.",
  },
  {
    line: "85–94",
    code: `messageSection + map COMPLETE_REQUEST_LINES`,
    note: "② 요청 메시지. 줄마다 <p>. 지금은 읽기 전용.",
  },
  {
    line: "97–104",
    code: `actions: Link /cart , Link /purchase/requests`,
    note: "③ CTA. secondary=snack-background-500+#accent, primary=accent. sm은 order로 primary 위.",
  },
  {
    line: "(스타일)",
    code: `max-md:… / bg-snack-background-500 / order`,
    note: "md/sm 시안을 Tailwind 반응형 유틸로 표현. module.css 없음.",
  },
  {
    line: "(범위)",
    code: `모달 · 실데이터 · 구매 API 없음`,
    note: "의도적 제외. 더미 UI + 링크 QA 구간.",
  },
];

function LineList({
  file,
  lines,
}: {
  file: string;
  lines: LineNote[];
}) {
  return (
    <div className={styles.lineList}>
      <p className={styles.fileLabel}>{file}</p>
      <ol className={styles.lines}>
        {lines.map((item) => (
          <li key={`${item.line}-${item.code}`} className={styles.lineItem}>
            <div className={styles.lineMeta}>
              <span className={styles.lineNo}>L{item.line}</span>
              <code className={styles.lineCode}>{item.code}</code>
            </div>
            <p className={styles.lineNote}>{item.note}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function CartDocsPage() {
  const [area, setArea] = useState<AreaId>("cart");
  const [cartSection, setCartSection] = useState<CartSectionId>("map");
  const [completeSection, setCompleteSection] =
    useState<CompleteSectionId>("map");
  const [tailwindSection, setTailwindSection] =
    useState<TailwindSectionId>("basics");

  const areaMeta = AREAS.find((item) => item.id === area)!;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className={styles.kicker}>Docs · Cart · Complete · Tailwind</p>
          <h1 className={styles.title}>장바구니 · 구매완료 · 팀 Tailwind</h1>
          <p className={styles.lead}>
            위는 영역 탭, 아래는 세부 탭입니다.
            {areaMeta.href ? (
              <>
                {" "}
                현재 영역 화면:{" "}
                <Link href={areaMeta.href} className={styles.inlineLink}>
                  {areaMeta.href}
                </Link>
              </>
            ) : (
              <>
                {" "}
                Tailwind 치트시트는{" "}
                <code>globals.css</code> <code>@theme</code> 기준입니다.
              </>
            )}
          </p>
        </header>

        <nav className={styles.areaTabs} aria-label="문서 영역">
          {AREAS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                area === item.id
                  ? `${styles.areaTab} ${styles.areaTabActive}`
                  : styles.areaTab
              }
              onClick={() => setArea(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {area === "cart" ? (
          <>
            <nav className={styles.tabs} aria-label="장바구니 파일">
              {CART_SECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    cartSection === item.id
                      ? `${styles.tab} ${styles.tabActive}`
                      : styles.tab
                  }
                  onClick={() => setCartSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {cartSection === "map" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>장바구니 흐름</h2>
                <pre className={styles.code}>
                  <code>{`상세 담기  addToCart
  → localStorage (cartStorage.ts)
  → notifyCartChange
  → AppHeader 뱃지
  → /cart (page.tsx · Tailwind, module.css 없음)`}</code>
                </pre>
                <p className={styles.body}>
                  읽는 순서 추천:{" "}
                  <strong>cartStorage → cart/page → AppHeader</strong>. 스타일은
                  budget/Header와 같이 <code>className</code> Tailwind +{" "}
                  <code>globals.css</code> 토큰만 사용합니다.
                </p>
              </section>
            ) : null}

            {cartSection === "storage" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>cartStorage.ts</h2>
                <LineList file="src/lib/cartStorage.ts" lines={STORAGE_LINES} />
              </section>
            ) : null}

            {cartSection === "page" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>cart/page.tsx</h2>
                <p className={styles.body}>
                  <code>cart.module.css</code>는 제거됨. UI 클래스는 이 파일의
                  Tailwind 유틸로 작성.
                </p>
                <LineList file="src/app/cart/page.tsx" lines={PAGE_LINES} />
              </section>
            ) : null}

            {cartSection === "badge" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>AppHeader.tsx</h2>
                <LineList
                  file="src/components/layout/AppHeader.tsx"
                  lines={BADGE_LINES}
                />
              </section>
            ) : null}

            {cartSection === "media" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>productMedia.ts</h2>
                <LineList file="src/lib/productMedia.ts" lines={MEDIA_LINES} />
              </section>
            ) : null}

            {cartSection === "detail" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>상품 상세 · 담기</h2>
                <LineList
                  file="src/app/products/[id]/page.tsx"
                  lines={DETAIL_LINES}
                />
              </section>
            ) : null}
          </>
        ) : null}

        {area === "complete" ? (
          <>
            <nav className={styles.tabs} aria-label="구매완료 파일">
              {COMPLETE_SECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    completeSection === item.id
                      ? `${styles.tab} ${styles.tabActive}`
                      : styles.tab
                  }
                  onClick={() => setCompleteSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {completeSection === "map" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>구매완료 흐름</h2>
                <pre className={styles.code}>
                  <code>{`/purchase/requests/complete  (더미 UI)
  ① 상품요약  ② 요청메시지  ③ CTA
  CTA → /cart · /purchase/requests
  (모달 · API · 실데이터 = 아직 없음)

파일
  complete/page.tsx  ← Tailwind (module.css 삭제)`}</code>
                </pre>
                <p className={styles.body}>
                  장바구니와 동일하게 <strong>complete/page</strong> 한 파일에
                  스타일·로직을 둡니다.
                </p>
              </section>
            ) : null}

            {completeSection === "page" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>complete/page.tsx</h2>
                <p className={styles.body}>
                  경로:{" "}
                  <Link
                    href="/purchase/requests/complete"
                    className={styles.inlineLink}
                  >
                    /purchase/requests/complete
                  </Link>
                  . <code>complete.module.css</code> 없음. 구경로
                  <code>/purchase-requests/complete</code>는 리다이렉트.
                </p>
                <LineList
                  file="src/app/(private)/purchase/requests/complete/page.tsx"
                  lines={COMPLETE_LINES}
                />
              </section>
            ) : null}
          </>
        ) : null}

        {area === "tailwind" ? (
          <>
            <nav className={styles.tabs} aria-label="Tailwind 치트시트">
              {TAILWIND_SECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    tailwindSection === item.id
                      ? `${styles.tab} ${styles.tabActive}`
                      : styles.tab
                  }
                  onClick={() => setTailwindSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {tailwindSection === "basics" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>기본 사용법 (팀)</h2>
                <p className={styles.body}>
                  이 레포는 Tailwind <strong>v4</strong>가 이미 깔려 있습니다.
                  설치 Get Started를 다시 할 필요 없고,{" "}
                  <code>globals.css</code>의{" "}
                  <code>@import &quot;tailwindcss&quot;</code> + PostCSS만
                  있으면 됩니다. 페이지마다 CSS Module을 새로 만들지 않고{" "}
                  <code>className</code>에 유틸을 적습니다 (cart / complete /
                  Header / budget).
                </p>
                <pre className={styles.code}>
                  <code>{`// 일반 노트 예시 (기본 팔레트)
<div className="h-10 w-12 bg-gray-400 text-white" />

// 팀 시안에 맞출 때 (globals @theme 토큰)
<div className="h-10 w-12 bg-accent text-surface" />`}</code>
                </pre>
                <p className={styles.body}>
                  클래스 순서상 나중에 오는 유틸이 같은 속성을 덮을 수 있으니,
                  색·간격이 안 먹으면 DevTools로 어떤 클래스가 이겼는지
                  확인하세요.
                </p>
              </section>
            ) : null}

            {tailwindSection === "size" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>사이즈</h2>
                <p className={styles.body}>
                  <code>w-</code> / <code>h-</code> 스케일(<code>w-12</code>,{" "}
                  <code>h-16</code>), 비율(<code>w-1/2</code>,{" "}
                  <code>w-full</code>), 임의값(<code>w-[140px]</code>,{" "}
                  <code>max-w-[688px]</code>)을 씁니다. 가운데 정렬은{" "}
                  <code>mx-auto</code>.
                </p>
                <pre className={styles.code}>
                  <code>{`// 구매완료 패널 폭
<div className="mx-auto w-full max-w-[688px] …" />

// 장바구니 썸네일 (기본 160px, 좁으면 140px)
<span className="size-40 max-[1400px]:size-[140px]" />

// 버튼 높이
className="h-16 max-md:h-[54px]"`}</code>
                </pre>
              </section>
            ) : null}

            {tailwindSection === "color" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>색상 — 팀 토큰</h2>
                <p className={styles.body}>
                  일반 노트의 <code>tailwind.config.js</code>{" "}
                  <code>theme.extend.colors</code>는 <strong>쓰지 않습니다</strong>.
                  색은 <code>src/app/globals.css</code>의{" "}
                  <code>:root</code> (<code>--snack-*</code>) +{" "}
                  <code>@theme inline</code> (<code>--color-*</code>)에
                  정의되어 있고, 클래스로는{" "}
                  <code>bg-이름</code> / <code>text-이름</code> 형태입니다
                  (예: <code>bg-accent</code>).
                </p>
                <pre className={styles.code}>
                  <code>{`// globals.css @theme 예
--color-accent: var(--snack-orange-400);     // → bg-accent, text-accent
--color-surface-muted: var(--snack-background-400);
--color-snack-background-500: …              // → bg-snack-background-500

// 사용
<button className="bg-accent text-surface">요청 내역</button>
<button className="bg-snack-background-500 text-accent">장바구니로</button>`}</code>
                </pre>
                <ul className={styles.tokenList}>
                  {TEAM_COLOR_TOKENS.map((token) => (
                    <li key={token.utility}>
                      <code>{token.utility}</code>
                      <span>{token.meaning}</span>
                    </li>
                  ))}
                </ul>
                <p className={styles.body}>
                  <code>bg-red-400</code> 같은 기본 팔레트도 동작하지만, 시안
                  맞출 때는 위 토큰을 우선하세요.
                </p>
              </section>
            ) : null}

            {tailwindSection === "display" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>디스플레이</h2>
                <p className={styles.body}>
                  <code>flex</code>, <code>grid</code>, <code>hidden</code> 등을
                  class로 붙입니다. 정렬은 <code>items-center</code>,{" "}
                  <code>justify-between</code>, <code>place-items-center</code>.
                </p>
                <p className={styles.body}>
                  <strong>flex vs inline-flex:</strong> 장바구니·완료처럼 줄 전체
                  배치는 <code>flex</code>. 내용만큼만 잡는 칩/뱃지는{" "}
                  <code>inline-flex</code> (랜딩 <code>.badge</code>). Figma가
                  “Flex”라고만 적어도 뱃지는 보통 inline-flex가 맞습니다.
                </p>
                <pre className={styles.code}>
                  <code>{`// 구매완료 총액 줄
<div className="flex w-full items-center justify-between">
  <strong>총 9개</strong>
  <strong className="text-accent">43,000원</strong>
</div>

// 장바구니 체크박스 셀
<button className="grid size-[26px] place-items-center …" />

// 칩/뱃지 (Module 예: page.module.css .badge)
/* display: inline-flex; → Tailwind: inline-flex */`}</code>
                </pre>
              </section>
            ) : null}

            {tailwindSection === "responsive" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>반응형</h2>
                <p className={styles.body}>
                  기본 breakpoint는 <strong>min-width</strong> 입니다:{" "}
                  <code>sm</code> 640 · <code>md</code> 768 · <code>lg</code>{" "}
                  1024 · <code>xl</code> 1280. 팀 코드에는{" "}
                  <code>max-md:</code>(768 이하),{" "}
                  <code>max-[1400px]:</code> 같은 <strong>max-</strong> 변형도
                  자주 나옵니다. 방향을 헷갈리지 마세요.
                </p>
                <pre className={styles.code}>
                  <code>{`// min-width (노트 기본)
<div className="w-16 md:w-32 lg:w-48" />

// max-width — 구매완료 sm에서 primary 위
<Link className="… max-md:order-1" />   // 요청 내역
<Link className="… max-md:order-2" />   // 장바구니로

// Header / cart
className="… xl:px-[120px] md:h-[144px]"`}</code>
                </pre>
              </section>
            ) : null}

            {tailwindSection === "spacing" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>여백</h2>
                <p className={styles.body}>
                  <code>p-</code> / <code>m-</code> / <code>px-</code> /{" "}
                  <code>py-</code> / <code>gap-</code>. 스케일 숫자 또는{" "}
                  <code>p-3.5</code>, <code>gap-8</code>,{" "}
                  <code>px-[120px]</code>.
                </p>
                <pre className={styles.code}>
                  <code>{`// 구매완료 페이지 바깥
<main className="… px-6 py-10">

// 요약 카드 안 간격
<section className="flex flex-col gap-8 p-8 max-md:gap-4 max-md:px-0">`}</code>
                </pre>
              </section>
            ) : null}

            {tailwindSection === "figma" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>지금 .tags vs 시안</h2>
                <p className={styles.body}>
                  Figma Badges <code>1877:40387</code> ↔{" "}
                  <code>page.module.css</code> <code>.tags</code> (하단 UI/UX ·
                  Figma). 고급 프로젝트 <code>.badge</code>와 혼동 금지.
                </p>
                <div className={styles.compare}>
                  {LANDING_TAGS_COMPARE.map((row) => (
                    <div key={row.prop} className={styles.compareRow}>
                      <div className={styles.compareCol}>
                        <p className={styles.compareLabel}>
                          시안 · {row.prop}
                        </p>
                        <p className={styles.compareValue}>{row.figma}</p>
                      </div>
                      <span className={styles.arrow} aria-hidden="true">
                        →
                      </span>
                      <div className={styles.compareCol}>
                        <p className={styles.compareLabel}>코드</p>
                        <p className={styles.compareValue}>{row.code}</p>
                        <p className={styles.compareNote}>{row.note}</p>
                        <span
                          className={`${styles.badge} ${
                            row.verdict === "ok" || row.verdict === "added"
                              ? styles.badgeOk
                              : row.verdict === "skip"
                                ? styles.badgeSkip
                                : styles.badgeOptional
                          }`}
                        >
                          {row.verdict === "ok"
                            ? "맞음"
                            : row.verdict === "added"
                              ? "추가함"
                              : row.verdict === "skip"
                                ? "미적용"
                                : "선택"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <pre className={styles.code}>
                  <code>{`/* page.module.css — 반영본 */
.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start; /* 추가 */
  justify-content: flex-end;
  gap: 16px;
  /* width: 620px;  ← 넣지 않음 */
}

/* 같은 의도 Tailwind */
<div className="flex flex-wrap items-start justify-end gap-4">`}</code>
                </pre>
              </section>
            ) : null}

            {tailwindSection === "examples" ? (
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>우리 코드 예시</h2>
                <p className={styles.body}>
                  cart / complete에서 실제로 쓰는 한 줄들입니다.
                </p>
                <LineList
                  file="src/app/cart/page.tsx · complete/page.tsx"
                  lines={[
                    {
                      line: "cart",
                      code: `main className="min-h-[calc(100vh-88px)] w-full bg-surface-muted"`,
                      note: "페이지 배경 = surface-muted (크림).",
                    },
                    {
                      line: "cart",
                      code: `className="… bg-accent px-6 py-3 text-lg font-semibold text-surface"`,
                      note: "빈 장바구니 CTA. 주황 배경 + 흰 글자.",
                    },
                    {
                      line: "cart",
                      code: `className="… bg-background … text-accent"`,
                      note: "계속 쇼핑하기. background 토큰(#fdf0df) + accent 글자.",
                    },
                    {
                      line: "complete",
                      code: `className="… bg-snack-background-500 text-accent max-md:order-2"`,
                      note: "장바구니로 돌아가기. 2차 QA에서 #fdf0df 맞춤.",
                    },
                    {
                      line: "complete",
                      code: `className="… bg-accent text-surface max-md:order-1"`,
                      note: "요청 내역. sm에서 order로 위쪽.",
                    },
                    {
                      line: "complete",
                      code: `strong className="… text-accent … max-md:text-xl"`,
                      note: "총 금액 주황 + 모바일 타이포 축소.",
                    },
                  ]}
                />
              </section>
            ) : null}
          </>
        ) : null}

        <footer className={styles.footer}>
          <Link href="/docs/structure" className={styles.footerLink}>
            ← 구조·일정
          </Link>
          {areaMeta.href ? (
            <Link href={areaMeta.href} className={styles.footerLink}>
              {area === "cart" ? "/cart" : "구매완료"} 화면 →
            </Link>
          ) : (
            <Link href="/cart" className={styles.footerLink}>
              Tailwind 적용 예 · /cart →
            </Link>
          )}
        </footer>
      </div>
    </main>
  );
}
