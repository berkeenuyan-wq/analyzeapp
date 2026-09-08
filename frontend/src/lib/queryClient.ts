import { QueryClient } from "@tanstack/react-query";

import { ApiRequestError } from "./api";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't hammer the sidecar on a 4xx; a transient network blip retries.
          if (error instanceof ApiRequestError && error.status >= 400) {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
  });
}
