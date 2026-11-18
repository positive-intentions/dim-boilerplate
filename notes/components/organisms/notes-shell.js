/**
 * Proxy for remote NotesShell — see dimui dimui/components/notes/organisms/notes-shell
 */
BP.module(
  "notes/components/organisms/notes-shell",
  ["dimui/components/notes/organisms/notes-shell"],
  function (mod) {
    return { NotesShell: mod.NotesShell };
  },
);
