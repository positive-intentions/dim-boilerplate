/**
 * Proxy for remote NoteList — see dimui dimui/components/notes/organisms/note-list
 */
BP.module(
  "notes/components/organisms/note-list",
  ["dimui/components/notes/organisms/note-list"],
  function (mod) {
    return { NoteList: mod.NoteList };
  },
);
