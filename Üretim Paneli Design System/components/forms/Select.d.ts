import * as React from "react";

export interface SelectOption { value: string; label: string }

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "size" | "style"> {
  value?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Plain strings or {value,label} pairs. */
  options?: (string | SelectOption)[];
  /** Rendered as a disabled-looking empty first option. */
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  icon?: string;
  style?: React.CSSProperties;
}
export function Select(props: SelectProps): JSX.Element;
