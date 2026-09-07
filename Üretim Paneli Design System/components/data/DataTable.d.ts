import * as React from "react";

export interface DataTableColumn<Row = any> {
  key: string;
  header: React.ReactNode;
  align?: "left" | "right" | "center";
  /** Renders in the mono face with tabular figures. Numbers are ALWAYS right-aligned + numeric. */
  numeric?: boolean;
  emphasis?: boolean;
  wrap?: boolean;
  sortable?: boolean;
  width?: string | number;
  render?: (row: Row, index: number) => React.ReactNode;
}

/**
 * Detail table for the row-level data behind a chart.
 * @startingPoint section="Tablolar" subtitle="Sıralanabilir detay tablosu" viewport="700x300"
 */
export interface DataTableProps<Row = any> extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  keyField?: string;
  /** Tighter row height for long tables on desktop. */
  dense?: boolean;
  zebra?: boolean;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;
  /** Turkish empty message. */
  emptyLabel?: string;
  /** Totals row keyed by column key — e.g. { arac: "Toplam", ton: "1.284,6" }. */
  footRow?: Record<string, React.ReactNode>;
  style?: React.CSSProperties;
}
export function DataTable<Row = any>(props: DataTableProps<Row>): JSX.Element;
