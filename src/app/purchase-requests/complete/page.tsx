import Link from "next/link";

import styles from "./complete.module.css";

export default function PurchaseRequestCompletePage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>구매 요청이 완료되었습니다</h1>
        <p className={styles.description}>
          요청 내역은 구매 요청 내역에서 확인할 수 있습니다.
        </p>
        <div className={styles.actions}>
          <Link href="/purchase/requests" className={styles.primary}>
            구매 요청 내역 보기
          </Link>
          <Link href="/products" className={styles.secondary}>
            상품 목록으로
          </Link>
        </div>
      </div>
    </main>
  );
}
