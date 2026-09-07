import * as React from "react";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "style"> {
  icon?: string;
  /** What is missing, in Turkish: "Bu tarihte kayıt yok". */
  title?: React.ReactNode;
  /** One sentence on why, and what to do. */
  description?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
  style?: React.CSSProperties;
}
export function EmptyState(props: EmptyStateProps): JSX.Element;
