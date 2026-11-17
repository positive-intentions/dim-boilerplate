/**
 * Proxy for remote dimui SearchField — see dimui/src/components/molecules/search-field.js
 */
BP.module(
  "notes/components/molecules/search-field",
  ["dimui/components/molecules/search-field"],
  function (mod) {
    return { SearchField: mod.SearchField };
  },
);
