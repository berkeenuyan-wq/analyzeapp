import { useQuery } from "@tanstack/react-query";

import { KpiTile } from "../../components/KpiTile";
import { tr } from "../../i18n/tr";
import { api } from "../../lib/api";
import { formatNumber } from "../../lib/format";
import { queryKeys } from "../../lib/queryKeys";
import styles from "./Overview.module.css";

export function Overview() {
  const headline = useQuery({
    queryKey: queryKeys.metrics.headline(),
    queryFn: api.headline,
  });

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{tr.overview.title}</h1>

      <div className={styles.grid}>
        {headline.isError ? (
          <div className={styles.inlineError} role="alert">
            <span>{tr.error.loadFailed}</span>
            <button
              type="button"
              onClick={() => void headline.refetch()}
              className={styles.retry}
            >
              {tr.error.retry}
            </button>
          </div>
        ) : (
          <KpiTile
            label={tr.kpi.ortToplamVerim}
            unit={tr.kpi.unitPct}
            emptyText={headline.isLoading ? "…" : tr.kpi.noData}
            value={
              headline.data
                ? formatNumber(headline.data.ort_toplam_verim, 2)
                : null
            }
          />
        )}
      </div>
    </section>
  );
}
