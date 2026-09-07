import * as React from "react";

/**
 * @startingPoint section="Formlar" subtitle="Metin ve sayı girişi" viewport="700x150"
 */
export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size" | "style"> {
  value?: string | number;
  /** Called with the raw string value, then the event. */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  /** Leading Lucide glyph, e.g. "search", "truck". */
  icon?: string;
  /** Trailing unit label: "ton", "kg", "%". */
  suffix?: React.ReactNode;
  type?: "text" | "number" | "date" | "time" | "search";
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  align?: "left" | "right" | "center";
  style?: React.CSSProperties;
}
export function TextInput(props: TextInputProps): JSX.Element;
