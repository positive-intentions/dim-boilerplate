(function () {
  var e2e = DimTest.e2e || DimTest.test;
  var expect = DimTest.expect;

  // Path notes/e2e/*.e2e.test.js also classifies as e2e if DimTest.e2e is absent.
  e2e("e2e: index.html create vault, lock, unlock screen", async function () {
    expect(typeof DimTest.open).toBe("function");

    var page = await DimTest.open("./index.html", {
      ready: "boilerplate-app",
      timeout: 60000,
    });

    await page.wait("dimui-unlock", 30000);
    expect(page.text("dimui-unlock")).toContain("Notes");

    var fields = page.queryAll("dimui-text-field");
    expect(fields.length).toBeGreaterThan(1);
    await page.fill(fields[0], "pass1234");
    await page.fill(fields[1], "pass1234");
    await page.click("dimui-button");

    await page.wait("dimui-notes-shell", 30000);
    await page.wait(function () {
      var shell = page.query("dimui-notes-shell");
      if (!shell) return null;
      var t = page.text(shell);
      if (t.indexOf("Decrypting") >= 0 || t.indexOf("Opening vault") >= 0) {
        return null;
      }
      return page.query("dimui-notes-layout");
    }, 30000);

    expect(page.query("dimui-notes-layout")).toBeTruthy();

    var header = page.query("dimui-notes-header");
    expect(header).toBeTruthy();
    var lockBtn =
      header.shadowRoot &&
      header.shadowRoot.querySelector("dimui-icon-button");
    expect(lockBtn).toBeTruthy();
    await page.click(lockBtn);

    await page.wait("dimui-unlock", 30000);
    expect(page.query("dimui-notes-shell")).toBe(null);
    expect(page.text("dimui-unlock")).toContain("Notes");
    // Leave iframe open for the E2E preview panel after the suite.
  });
})();
