/**
 * Proxy for remote dimui Icon — see dimui/src/components/atoms/icon.js
 */
BP.module(
  "notes/components/atoms/icon",
  ["dimui/components/atoms/icon"],
  function (mod) {
    return { Icon: mod.Icon };
  },
);
