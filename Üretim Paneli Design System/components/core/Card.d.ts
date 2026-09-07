import * as React from "react";

/**
 * The universal container. Everything on a page lives in one — charts, tables,
 * forms. Cards never nest more than one level (use `inset` for the inner level).
 * @startingPoint section="Yerleşim" subtitle="Başlıklı kart kabuğu" viewport="700x260"
 */
export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "style" | "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Lucide name shown before the title, muted. */
  icon?: string;
  /** Right-aligned header slot — filters, IconButton, Badge. */
  actions?: React.ReactNode;
  children?: React.ReactNode;
  /** Border tone. Only ever set good/bad when the card's data is over threshold. */
  tone?: "default" | "good" | "bad" | "accent";
  padding?: string;
  /** Inner/second-level card: flat, no shadow, tighter radius. */
  inset?: boolean;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}
export function Card(props: CardProps): JSX.Element;
