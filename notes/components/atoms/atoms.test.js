(function () {
  var test = DimTest.test;
  var expect = DimTest.expect;

  test("atom and search-field proxies resolve", async function () {
    var button = await BP.require("notes/components/atoms/button");
    var icon = await BP.require("notes/components/atoms/icon");
    var iconButton = await BP.require("notes/components/atoms/icon-button");
    var chip = await BP.require("notes/components/atoms/chip");
    var textField = await BP.require("notes/components/atoms/text-field");
    var emptyState = await BP.require("notes/components/atoms/empty-state");
    var fab = await BP.require("notes/components/atoms/fab");
    var search = await BP.require("notes/components/molecules/search-field");

    expect(Boolean(button.Button)).toBe(true);
    expect(Boolean(icon.Icon)).toBe(true);
    expect(Boolean(iconButton.IconButton)).toBe(true);
    expect(Boolean(chip.Chip)).toBe(true);
    expect(Boolean(textField.TextField)).toBe(true);
    expect(Boolean(emptyState.EmptyState)).toBe(true);
    expect(Boolean(fab.Fab)).toBe(true);
    expect(Boolean(search.SearchField)).toBe(true);
  });
})();
