/**
 * Proxy for remote NoteEditor — see dimui dimui/components/notes/organisms/note-editor
 */
BP.module(
  "notes/components/organisms/note-editor",
  ["dimui/components/notes/organisms/note-editor"],
  function (mod) {
    return { NoteEditor: mod.NoteEditor };
  },
);
