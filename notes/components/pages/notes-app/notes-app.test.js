(function () {
  var test = DimTest.test;
  var expect = DimTest.expect;
  var mount = DimTest.mount;

  test("notes-app shows unlock UI when vault unset", async function () {
    var vault = await BP.require("notes/lib/vault");
    try {
      localStorage.removeItem(vault.VAULT_FLAG);
    } catch (e) {}

    await BP.require("notes/components/pages/notes-app");
    expect(customElements.get("dimui-notes-app")).toBeTruthy();

    var el = await mount("dimui-notes-app");
    expect(el.shadowRoot).toBeTruthy();

    // Wait a tick for child custom elements (unlock) to upgrade / render.
    await el.updateComplete;
    await new Promise(function (resolve) {
      requestAnimationFrame(function () {
        requestAnimationFrame(resolve);
      });
    });

    var unlock = el.shadowRoot.querySelector("dimui-unlock");
    expect(unlock).toBeTruthy();

    if (unlock.updateComplete) {
      await unlock.updateComplete;
    }

    var unlockRoot = unlock.shadowRoot;
    expect(unlockRoot).toBeTruthy();
    var heading = unlockRoot.querySelector("h1");
    expect(heading).toBeTruthy();
    expect(heading.textContent).toContain("Notes");
  });
})();
