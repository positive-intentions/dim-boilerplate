/**
 * Proxy for remote dimui TextField — see dimui/src/components/atoms/text-field.js
 */
BP.module(
  "notes/components/atoms/text-field",
  ["dimui/components/atoms/text-field"],
  function (mod) {
    return { TextField: mod.TextField };
  },
);
