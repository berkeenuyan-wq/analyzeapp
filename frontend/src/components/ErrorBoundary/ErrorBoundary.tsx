import { Component, type ErrorInfo, type ReactNode } from "react";

import { tr } from "../../i18n/tr";
import styles from "./ErrorBoundary.module.css";

interface Props {
  children: ReactNode;
  /** Distinguishes boundaries in logs (route name, widget id). */
  label?: string;
}

interface State {
  error: Error | null;
}

/**
 * Wraps every route element (and, later, every dashboard widget). A failure
 * degrades to a compact card with the Turkish message + retry — never a blank
 * screen (docs/CODING_STANDARDS.md §2).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const where = this.props.label ? ` [${this.props.label}]` : "";
    const msg = `renderer error${where}: ${error.message}\n${info.componentStack ?? ""}`;
    window.up?.log("error", msg);
    // eslint-disable-next-line no-console
    console.error(msg);
  }

  private handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className={styles.card} role="alert">
          <p className={styles.title}>{tr.error.title}</p>
          <p className={styles.detail}>{this.state.error.message}</p>
          <button
            type="button"
            className={styles.retry}
            onClick={this.handleRetry}
          >
            {tr.error.retry}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
