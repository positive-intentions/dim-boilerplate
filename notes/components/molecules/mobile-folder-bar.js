/**
 * Proxy for remote MobileFolderBar — see dimui dimui/components/notes/molecules/mobile-folder-bar
 */
BP.module(
  "notes/components/molecules/mobile-folder-bar",
  ["dimui/components/notes/molecules/mobile-folder-bar"],
  function (mod) {
    return { MobileFolderBar: mod.MobileFolderBar };
  },
);
