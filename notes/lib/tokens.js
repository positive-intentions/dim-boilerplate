/**
 * Proxy for remote dimui notes tokens — aliases onto --dimui-color-*
 */
BP.module(
  "notes/lib/tokens",
  ["dimui/lib/notes/tokens"],
  function (mod) {
    return { notesTokens: mod.notesTokens };
  },
);
