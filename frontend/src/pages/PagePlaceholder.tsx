import { tr } from "../i18n/tr";
import styles from "./PagePlaceholder.module.css";

/** Shared shell for the five pages that land in later phases. */
export function PagePlaceholder({ title }: { title: string }) {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.note}>{tr.placeholder.comingSoon}</p>
    </section>
  );
}
