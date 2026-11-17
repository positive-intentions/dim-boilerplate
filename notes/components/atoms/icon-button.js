/**
 * Proxy for remote dimui IconButton — see dimui/src/components/atoms/icon-button.js
 */
BP.module(
  "notes/components/atoms/icon-button",
  ["dimui/components/atoms/icon-button"],
  function (mod) {
    return { IconButton: mod.IconButton };
  },
);
