(function () {
  var e2e = DimTest.e2e || DimTest.test;
  var expect = DimTest.expect;
  var H = DimE2E;

  e2e("e2e: theme toggle updates notes data-theme", async function () {
    var page = await H.openApp();
    await H.createVault(page, "pass1234");

    var before = H.notesTheme(page);
    expect(before === "light" || before === "dark").toBeTruthy();

    var clicked = await H.clickThemeToggle(page);
    expect(clicked === "Light" || clicked === "Dark").toBeTruthy();

    await page.wait(function () {
      var after = H.notesTheme(page);
      return after && after !== before ? after : null;
    }, 10000);

    var after = H.notesTheme(page);
    expect(after).toBe(before === "light" ? "dark" : "light");
  });
})();
