/** Typed query-key factory. Every `useQuery` key comes from here. */
export const queryKeys = {
  health: () => ["health"] as const,
  metrics: {
    headline: () => ["metrics", "headline"] as const,
  },
} as const;
