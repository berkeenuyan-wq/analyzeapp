import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { createQueryClient } from "./lib/queryClient";
import { ThemeProvider } from "./lib/theme";
import { router } from "./routes";
import "./styles/tokens.css";
import "./styles/global.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root not found");
}

const queryClient = createQueryClient();

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary label="root">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
