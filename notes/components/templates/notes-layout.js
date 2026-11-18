/**
 * Proxy for remote NotesLayout — see dimui dimui/components/notes/templates/notes-layout
 */
BP.module(
  "notes/components/templates/notes-layout",
  ["dimui/components/notes/templates/notes-layout"],
  function (mod) {
    return { NotesLayout: mod.NotesLayout };
  },
);
