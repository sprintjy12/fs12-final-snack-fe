import styles from "./ProductsSkeleton.module.css";

export function ProductsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={styles.grid} aria-busy="true" aria-label="상품 불러오는 중">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.thumb} />
          <div className={styles.line} />
          <div className={styles.lineShort} />
          <div className={styles.linePrice} />
        </div>
      ))}
    </div>
  );
}
