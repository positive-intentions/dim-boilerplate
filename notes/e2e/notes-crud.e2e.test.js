(function () {
  var e2e = DimTest.e2e || DimTest.test;
  var expect = DimTest.expect;
  var H = DimE2E;

  e2e("e2e: edit seeded note title and body", async function () {
    var page = await H.openApp();
    await H.createVault(page, "pass1234");
    await H.openFirstNote(page);
    await H.fillNoteEditor(page, "E2E Coverage Note", "Hello from iframe e2e");

    var editor = page.query("dimui-note-editor");
    expect(editor.shadowRoot.querySelector(".title-input").value).toBe(
      "E2E Coverage Note",
    );
    expect(editor.shadowRoot.querySelector(".body-input").value).toContain(
      "Hello from iframe e2e",
    );

    await page.wait(function () {
      var items = page.queryAll("dimui-note-item");
      for (var i = 0; i < items.length; i++) {
        if (page.text(items[i]).indexOf("E2E Coverage Note") >= 0) {
          return items[i];
        }
      }
      return null;
    }, 15000);
  });
})();

