import styles from "./KpiTile.module.css";

export type Tone = "good" | "caution" | "bad" | "neutral";

interface KpiTileProps {
  label: string;
  /** Pre-formatted display value, or `null` when there is no data. */
  value: string | null;
  unit?: string;
  tone?: Tone;
  /** Text that names the tone — colour is never the only signal (RULES §12). */
  toneLabel?: string;
  emptyText: string;
}

export function KpiTile({
  label,
  value,
  unit,
  tone = "neutral",
  toneLabel,
  emptyText,
}: KpiTileProps) {
  const hasValue = value !== null;
  return (
    <article className={styles.tile} data-tone={tone}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>
        {hasValue ? value : <span className={styles.empty}>{emptyText}</span>}
        {hasValue && unit ? <span className={styles.unit}>{unit}</span> : null}
      </p>
      {toneLabel && tone !== "neutral" ? (
        <p className={styles.toneRow}>
          <span className={styles.toneDot} aria-hidden="true" />
          {toneLabel}
        </p>
      ) : null}
    </article>
  );
}
