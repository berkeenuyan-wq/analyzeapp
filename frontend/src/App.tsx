import { Outlet } from "react-router-dom";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { IconRail } from "./components/IconRail";
import styles from "./App.module.css";

/** The persistent shell: left icon rail + routed content area. */
export function AppShell() {
  return (
    <div className={styles.shell}>
      <IconRail />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

/** Wraps a route element in its own boundary so one page can't blank the app. */
export function RouteBoundary({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return <ErrorBoundary label={label}>{children}</ErrorBoundary>;
}
