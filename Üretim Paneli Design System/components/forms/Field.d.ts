import * as React from "react";

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  /** Turkish label, sentence case, no colon: "Araç plakası". */
  label?: React.ReactNode;
  /** Helper text shown when there is no error. */
  hint?: React.ReactNode;
  /** Error message — replaces the hint and turns the row red. */
  error?: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  children?: React.ReactNode;
  /** Grid column span inside a FormGrid. */
  span?: number;
  style?: React.CSSProperties;
}
export function Field(props: FieldProps): JSX.Element;
