import Link from "next/link";

import { CommonImage } from "@/components/ui";

import styles from "@/app/page.module.css";

const BUBBLES = [
  { id: "tl", text: "쉽고 빠르게 구매를 요청해보세요", position: "topLeft" },
  { id: "bl", text: "내가 원하는 간식을, 원하는 만큼!", position: "bottomLeft" },
  { id: "tr", text: "다양한 품목도 한 눈에 파악해요", position: "topRight" },
  {
    id: "br",
    text: "관리자와 유저 모두 이용 가능해요",
    position: "bottomRight",
  },
] as const;

export default function HomePage() {
  return (
    <main className={styles.cover}>
      <div className={styles.stage}>
        <div className={styles.badge}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cover/badge-notebook.svg"
            alt=""
            width={40}
            height={40}
            className={styles.badgeIcon}
          />
          <span>고급 프로젝트</span>
        </div>

        <div className={styles.heroCopy}>
          <CommonImage
            name="logo-landing"
            size="md"
            label="Snack"
            className={styles.brand}
          />
          <p className={styles.tagline}>
            흩어진 간식 구매처를 통합하고, 기수별 지출을 똑똑하게 관리하세요
          </p>
        </div>

        <div className={styles.heroVisual}>
          <CommonImage
            name="landing-illustration"
            size="md"
            className={styles.heroArt}
          />

          {BUBBLES.map((bubble) => (
            <div
              key={bubble.id}
              className={[styles.bubble, styles[bubble.position]].join(" ")}
            >
              <p>{bubble.text}</p>
              <span className={styles.bubbleTail} aria-hidden="true" />
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cover/codeit-logo.svg"
            alt="codeit"
            className={styles.codeit}
            width={245}
            height={69}
          />

          <div className={styles.tags}>
            <div className={styles.tag}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/cover/uiux-icon.svg"
                alt=""
                width={40}
                height={40}
                className={styles.tagIcon}
              />
              <span>UI/UX 디자인</span>
            </div>
            <div className={styles.tag}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/cover/figma-logo.svg"
                alt=""
                width={28}
                height={40}
              />
              <span>Figma</span>
            </div>
          </div>
        </div>

        <Link href="/products" className={styles.enter}>
          상품 보러가기
        </Link>
      </div>
    </main>
  );
}
