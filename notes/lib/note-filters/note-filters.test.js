(function () {
  var test = DimTest.test;
  var expect = DimTest.expect;

  test("filterNotes: all excludes trashed", async function () {
    var filters = await BP.require("notes/lib/note-filters");
    var mock = await BP.require("notes/lib/mockData");
    var notes = [
      { id: "a", trashed: false, pinned: false, folderId: "f1" },
      { id: "b", trashed: true, pinned: false, folderId: "f1" },
      { id: "c", trashed: false, pinned: true, folderId: "f2" },
    ];
    var out = filters.filterNotes(notes, mock.SMART_FOLDERS.all);
    expect(out.map(function (n) { return n.id; })).toEqual(["a", "c"]);
  });

  test("filterNotes: pinned and trash", async function () {
    var filters = await BP.require("notes/lib/note-filters");
    var mock = await BP.require("notes/lib/mockData");
    var notes = [
      { id: "a", trashed: false, pinned: true, folderId: "f1" },
      { id: "b", trashed: true, pinned: true, folderId: "f1" },
      { id: "c", trashed: false, pinned: false, folderId: "f1" },
    ];
    expect(
      filters.filterNotes(notes, mock.SMART_FOLDERS.pinned).map(function (n) {
        return n.id;
      }),
    ).toEqual(["a"]);
    expect(
      filters.filterNotes(notes, mock.SMART_FOLDERS.trash).map(function (n) {
        return n.id;
      }),
    ).toEqual(["b"]);
  });

  test("filterNotes: folder id and folderLabelFor", async function () {
    var filters = await BP.require("notes/lib/note-filters");
    var mock = await BP.require("notes/lib/mockData");
    var notes = [
      { id: "a", trashed: false, pinned: false, folderId: "f1" },
      { id: "b", trashed: false, pinned: false, folderId: "f2" },
    ];
    expect(
      filters.filterNotes(notes, "f1").map(function (n) {
        return n.id;
      }),
    ).toEqual(["a"]);
    expect(filters.folderLabelFor(mock.SMART_FOLDERS.all, [])).toBe(
      "All Notes",
    );
    expect(filters.folderLabelFor(mock.SMART_FOLDERS.pinned, [])).toBe(
      "Pinned",
    );
    expect(filters.folderLabelFor(mock.SMART_FOLDERS.trash, [])).toBe(
      "Recently Deleted",
    );
    expect(
      filters.folderLabelFor("f1", [{ id: "f1", name: "Personal" }]),
    ).toBe("Personal");
  });
})();
