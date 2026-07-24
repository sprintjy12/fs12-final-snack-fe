import styles from "./ProductsEmpty.module.css";

export type ProductsEmptyProps = {
  title?: string;
  description?: string;
  onReset?: () => void;
};

export function ProductsEmpty({
  title = "조건에 맞는 상품이 없습니다",
  description = "다른 카테고리나 정렬을 선택해 보세요.",
  onReset,
}: ProductsEmptyProps) {
  return (
    <div className={styles.empty} role="status">
      <span className={styles.emoji} aria-hidden="true">
        🍪
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {onReset ? (
        <button type="button" className={styles.resetButton} onClick={onReset}>
          필터 초기화
        </button>
      ) : null}
    </div>
  );
}
