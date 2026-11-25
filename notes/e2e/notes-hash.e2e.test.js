(function () {
  var e2e = DimTest.e2e || DimTest.test;
  var expect = DimTest.expect;
  var H = DimE2E;

  e2e("e2e: selecting a note updates location.hash", async function () {
    var page = await H.openApp();
    await H.createVault(page, "pass1234");
    await H.openFirstNote(page);
    await page.wait(function () {
      var path = H.hashPathname(page);
      return path.indexOf("/note/") === 0 ? path : null;
    }, 10000);
    expect(H.hashPathname(page).indexOf("/note/") === 0).toBeTruthy();

    await H.clickEditorBack(page);
    await page.wait(function () {
      return H.hashPathname(page) === "/" ? true : null;
    }, 10000);
    expect(H.hashPathname(page)).toBe("/");
  });

  e2e("e2e: hash after unlock opens note (deep link)", async function () {
    // Create → lock → unlock → apply hash. Covers the post-unlock applyFromPath
    // path used when booting with #/note/… (boot-with-hash is also covered in
    // dimui notes-shell unit tests).
    var page = await H.openApp();
    await H.createVault(page, "pass1234");
    await H.lockVault(page);
    await H.unlockVault(page, "pass1234");
    await H.waitShellReady(page);
    await H.setHash(page, "/note/note-welcome");
    await page.wait(function () {
      var editor = page.query("dimui-note-editor");
      if (!editor || !editor.shadowRoot) return null;
      var title = editor.shadowRoot.querySelector(".title-input");
      if (!title) return null;
      return title.value && title.value.indexOf("Welcome") >= 0 ? title : null;
    }, 15000);
    expect(H.hashPathname(page)).toContain("/note/note-welcome");
  });
})();
