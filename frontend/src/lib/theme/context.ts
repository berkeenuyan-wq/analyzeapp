import { createContext } from "react";

export type Theme = "dark" | "light";

export interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const THEME_STORAGE_KEY = "up.theme";
export const DEFAULT_THEME: Theme = "dark"; // dark is the base (docs/RULES.md §10)
