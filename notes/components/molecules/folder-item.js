/**
 * Proxy for remote FolderItem — see dimui dimui/components/notes/molecules/folder-item
 */
BP.module(
  "notes/components/molecules/folder-item",
  ["dimui/components/notes/molecules/folder-item"],
  function (mod) {
    return { FolderItem: mod.FolderItem };
  },
);
