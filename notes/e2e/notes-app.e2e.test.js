(function () {
  var e2e = DimTest.e2e || DimTest.test;
  var expect = DimTest.expect;
  var H = DimE2E;

  e2e("e2e: create vault then lock returns to unlock", async function () {
    expect(typeof DimTest.open).toBe("function");
    var page = await H.openApp();
    await H.createVault(page, "pass1234");
    expect(page.query("dimui-notes-layout")).toBeTruthy();
    await H.lockVault(page);
    expect(page.query("dimui-notes-shell")).toBe(null);
    expect(page.text("dimui-unlock")).toContain("Notes");
  });

  e2e("e2e: re-unlock shows seeded notes", async function () {
    var page = await H.openApp();
    await H.createVault(page, "pass1234");
    await H.lockVault(page);
    await H.unlockVault(page, "pass1234");
    await page.wait(function () {
      return page.query("dimui-note-item");
    }, 20000);
    expect(page.queryAll("dimui-note-item").length).toBeGreaterThan(0);
    expect(page.text("dimui-notes-layout")).toContain("All Notes");
  });

  e2e("e2e: wrong password after lock shows error", async function () {
    var page = await H.openApp();
    await H.createVault(page, "pass1234");
    await H.lockVault(page);

    var fields = page.queryAll("dimui-text-field");
    expect(fields.length).toBeGreaterThan(0);
    await page.fill(fields[0], "wrong-password-not-the-key");
    await page.click("dimui-button");

    await page.wait(function () {
      var unlock = page.query("dimui-unlock");
      return unlock && page.text(unlock).indexOf("Wrong password") >= 0
        ? unlock
        : null;
    }, 20000);
    expect(page.query("dimui-notes-shell")).toBe(null);
  });
})();
