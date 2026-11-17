/**
 * Proxy for remote dimui EmptyState — see dimui/src/components/atoms/empty-state.js
 */
BP.module(
  "notes/components/atoms/empty-state",
  ["dimui/components/atoms/empty-state"],
  function (mod) {
    return { EmptyState: mod.EmptyState };
  },
);
