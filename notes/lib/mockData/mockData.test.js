(function () {
  var test = DimTest.test;
  var expect = DimTest.expect;

  test("normalizeNote fills defaults", async function () {
    var mock = await BP.require("notes/lib/mockData");
    var note = mock.normalizeNote({
      id: "n1",
      title: "Hello",
      body: "World",
      folderId: "f1",
    });
    expect(note).toBeTruthy();
    expect(note.id).toBe("n1");
    expect(note.title).toBe("Hello");
    expect(note.body).toBe("World");
    expect(note.folderId).toBe("f1");
    expect(note.pinned).toBe(false);
    expect(note.trashed).toBe(false);
    expect(note.createdAt).toBeTruthy();
    expect(note.updatedAt).toBeTruthy();
  });

  test("normalizeNote rejects non-objects", async function () {
    var mock = await BP.require("notes/lib/mockData");
    expect(mock.normalizeNote(null)).toBe(null);
    expect(mock.normalizeNote("x")).toBe(null);
  });

  test("snippetFromBody truncates and handles empty", async function () {
    var mock = await BP.require("notes/lib/mockData");
    expect(mock.snippetFromBody("")).toBe("No additional text");
    expect(mock.snippetFromBody("  short  ")).toBe("short");
    var long = new Array(100).join("x");
    var snip = mock.snippetFromBody(long, 10);
    expect(snip.length).toBeGreaterThan(10);
    expect(snip).toContain("…");
  });
})();
