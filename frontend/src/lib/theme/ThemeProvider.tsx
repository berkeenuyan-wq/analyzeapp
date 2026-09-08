import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  ThemeContext,
  type Theme,
} from "./context";

function readStored(): Theme {
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    return v === "light" || v === "dark" ? v : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function applyToDocument(theme: Theme): void {
  // Dark = no attribute (bare :root); light = [data-theme="light"] re-scope.
  const root = document.documentElement;
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStored);

  useEffect(() => {
    applyToDocument(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* private mode / storage disabled — non-fatal */
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);
  const toggle = useCallback(() => {
    setThemeState((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, toggle, setTheme }),
    [theme, toggle, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
