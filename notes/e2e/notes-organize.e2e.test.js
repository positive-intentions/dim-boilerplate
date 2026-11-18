(function () {
  var e2e = DimTest.e2e || DimTest.test;
  var expect = DimTest.expect;
  var H = DimE2E;

  e2e("e2e: folder filter Personal then search", async function () {
    var page = await H.openApp();
    await H.createVault(page, "pass1234");
    await H.waitShellReady(page);

    await H.clickFolderByName(page, /Personal/i);
    await page.wait(function () {
      var layout = page.query("dimui-notes-layout");
      return layout && /Personal/i.test(page.text(layout)) ? layout : null;
    }, 10000);

    await H.fillSearch(page, "zzzz-no-match-e2e");
    await page.wait(function () {
      var list = page.query("dimui-note-list");
      if (!list) return null;
      var t = page.text(list);
      return /No matching|No notes|empty/i.test(t) ||
        list.querySelectorAll("dimui-note-item").length === 0
        ? list
        : null;
    }, 10000);

    await H.fillSearch(page, "");
    await H.clickFolderByName(page, /All Notes/i);
    await page.wait(function () {
      return page.queryAll("dimui-note-item").length > 0
        ? page.query("dimui-note-item")
        : null;
    }, 10000);
  });

  e2e("e2e: trash note then restore from Recently Deleted", async function () {
    var page = await H.openApp();
    await H.createVault(page, "pass1234");
    await H.openFirstNote(page);
    await H.fillNoteEditor(page, "Trash Me E2E", "temporary");

    await H.clickEditorAction(page, /trash/i);
    await H.confirmDialog(page, "dimui-note-editor");
    await H.sleep(300);

    await H.clickFolderByName(page, /Recently Deleted/i);
    await page.wait(function () {
      var items = page.queryAll("dimui-note-item");
      for (var i = 0; i < items.length; i++) {
        if (page.text(items[i]).indexOf("Trash Me E2E") >= 0) return items[i];
      }
      return null;
    }, 15000);

    var trashed = page.queryAll("dimui-note-item");
    var target = null;
    for (var j = 0; j < trashed.length; j++) {
      if (page.text(trashed[j]).indexOf("Trash Me E2E") >= 0) {
        target = trashed[j];
        break;
      }
    }
    expect(target).toBeTruthy();
    await page.click(target);

    await page.wait("dimui-note-editor", 10000);
    await H.clickEditorAction(page, /restore/i);

    await H.clickFolderByName(page, /All Notes/i);
    await page.wait(function () {
      var items = page.queryAll("dimui-note-item");
      for (var i = 0; i < items.length; i++) {
        if (page.text(items[i]).indexOf("Trash Me E2E") >= 0) return items[i];
      }
      return null;
    }, 15000);
  });
})();
