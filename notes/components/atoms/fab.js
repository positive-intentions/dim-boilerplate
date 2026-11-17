/**
 * Proxy for remote dimui Fab — see dimui/src/components/atoms/fab.js
 */
BP.module(
  "notes/components/atoms/fab",
  ["dimui/components/atoms/fab"],
  function (mod) {
    return { Fab: mod.Fab };
  },
);
