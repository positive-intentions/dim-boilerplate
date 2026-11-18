/**
 * Proxy for remote FolderRail — see dimui dimui/components/notes/organisms/folder-rail
 */
BP.module(
  "notes/components/organisms/folder-rail",
  ["dimui/components/notes/organisms/folder-rail"],
  function (mod) {
    return { FolderRail: mod.FolderRail };
  },
);
