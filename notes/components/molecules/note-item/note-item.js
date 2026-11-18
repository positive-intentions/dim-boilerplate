/**
 * Proxy for remote NoteItem — see dimui dimui/components/notes/molecules/note-item
 */
BP.module(
  "notes/components/molecules/note-item",
  ["dimui/components/notes/molecules/note-item"],
  function (mod) {
    return { NoteItem: mod.NoteItem };
  },
);
