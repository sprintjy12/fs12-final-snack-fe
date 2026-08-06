import Link from "next/link";

import styles from "./newProduct.module.css";

/** 상품 등록 폼은 판매자 플로우. 라우트만 예약해 [id]와 충돌을 막습니다. */
export default function NewProductPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>상품 등록</h1>
        <p className={styles.description}>
          상품 등록 기능은 준비 중입니다. 잠시 후 다시 이용해 주세요.
        </p>
        <Link href="/products" className={styles.link}>
          상품 목록으로
        </Link>
      </div>
    </main>
  );
}
