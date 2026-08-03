import styles from "@/app/page.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <span className={styles.emoji} aria-hidden="true">
          🍪
        </span>
        <h1>간식대장</h1>
        <p>프로젝트 기본 세팅이 완료되었습니다.</p>
      </section>
    </main>
  );
}
