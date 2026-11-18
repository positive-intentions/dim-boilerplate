(function () {
  var test = DimTest.test;
  var expect = DimTest.expect;

  test("tokens exports notesTokens", async function () {
    var tokens = await BP.require("notes/lib/tokens");
    expect(tokens.notesTokens).toBeTruthy();
  });
})();
