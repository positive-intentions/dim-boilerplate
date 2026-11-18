(function () {
  var test = DimTest.test;
  var expect = DimTest.expect;
  var mount = DimTest.mount;
  var shadowText = DimTest.shadowText;

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  async function waitFor(fn, label, timeoutMs) {
    var timeout = timeoutMs || 20000;
    var start = Date.now();
    while (Date.now() - start < timeout) {
      var value = fn();
      if (value) return value;
      await sleep(50);
    }
    throw new Error("timeout waiting for " + (label || "condition"));
  }

  function setTextField(field, value) {
    var input =
      field.shadowRoot && field.shadowRoot.querySelector("input, textarea");
    if (!input) throw new Error("text field input missing");
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function clickHost(host) {
    var btn =
      (host.shadowRoot && host.shadowRoot.querySelector("button")) || host;
    btn.click();
  }

  async function flush(el) {
    if (el && el.updateComplete) await el.updateComplete;
    await sleep(0);
    if (el && el.updateComplete) await el.updateComplete;
    await new Promise(function (r) {
      requestAnimationFrame(function () {
        requestAnimationFrame(r);
      });
    });
  }

  test("notes-app shows unlock UI when vault unset", async function () {
    var vault = await BP.require("notes/lib/vault");
    try {
      localStorage.removeItem(vault.VAULT_FLAG);
    } catch (e) {}

    await BP.require("notes/components/pages/notes-app");
    expect(customElements.get("dimui-notes-app")).toBeTruthy();

    var el = await mount("dimui-notes-app");
    expect(el.shadowRoot).toBeTruthy();
    await flush(el);

    var unlock = el.shadowRoot.querySelector("dimui-unlock");
    expect(unlock).toBeTruthy();
    if (unlock.updateComplete) await unlock.updateComplete;
    expect(unlock.shadowRoot.querySelector("h1").textContent).toContain(
      "Notes",
    );
  });

  test("notes-app create vault then lock returns to unlock", async function () {
    var vault = await BP.require("notes/lib/vault");
    try {
      localStorage.removeItem(vault.VAULT_FLAG);
    } catch (e) {}

    await BP.require("notes/components/pages/notes-app");
    var el = await mount("dimui-notes-app");
    await flush(el);

    var unlock = await waitFor(function () {
      return el.shadowRoot.querySelector("dimui-unlock");
    }, "unlock");
    await flush(unlock);

    var fields = unlock.shadowRoot.querySelectorAll("dimui-text-field");
    expect(fields.length).toBe(2);
    setTextField(fields[0], "pass1234");
    setTextField(fields[1], "pass1234");
    await flush(unlock);
    await flush(el);
    clickHost(unlock.shadowRoot.querySelector("dimui-button"));

    var shell = await waitFor(function () {
      return el.shadowRoot.querySelector("dimui-notes-shell");
    }, "shell after create");

    await waitFor(function () {
      var text = shadowText(shell);
      return (
        text.indexOf("Decrypting") < 0 &&
        text.indexOf("Opening vault") < 0 &&
        shell.shadowRoot.querySelector("dimui-notes-layout")
      );
    }, "shell ready");

    var layout = shell.shadowRoot.querySelector("dimui-notes-layout");
    var header = layout.shadowRoot.querySelector("dimui-notes-header");
    clickHost(header.shadowRoot.querySelector("dimui-icon-button"));

    unlock = await waitFor(function () {
      return el.shadowRoot.querySelector("dimui-unlock");
    }, "unlock after lock");
    expect(unlock).toBeTruthy();
  });

  test("notes-app wrong password shows error via unlockFailed", async function () {
    var vault = await BP.require("notes/lib/vault");
    try {
      localStorage.setItem(vault.VAULT_FLAG, "1");
    } catch (e) {}

    await BP.require("notes/components/pages/notes-app");
    var el = await mount("dimui-notes-app");
    await flush(el);

    var unlock = await waitFor(function () {
      return el.shadowRoot.querySelector("dimui-unlock");
    }, "unlock existing");
    await flush(unlock);

    var fields = unlock.shadowRoot.querySelectorAll("dimui-text-field");
    expect(fields.length).toBe(1);
    setTextField(fields[0], "wrong-password-not-the-key");
    await flush(unlock);
    await flush(el);
    clickHost(unlock.shadowRoot.querySelector("dimui-button"));

    await waitFor(function () {
      var u = el.shadowRoot.querySelector("dimui-unlock");
      return u && shadowText(u).indexOf("Wrong password") >= 0;
    }, "wrong password error");
  });
})();
