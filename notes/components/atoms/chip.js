/**
 * Proxy for remote dimui Chip — see dimui/src/components/atoms/chip.js
 */
BP.module(
  "notes/components/atoms/chip",
  ["dimui/components/atoms/chip"],
  function (mod) {
    return { Chip: mod.Chip };
  },
);
