(function () {
  var test = DimTest.test;
  var expect = DimTest.expect;
  var mount = DimTest.mount;

  function note(partial) {
    return Object.assign(
      {
        id: "n1",
        title: "Title",
        body: "Body text",
        folderId: "f1",
        pinned: false,
        trashed: false,
        updatedAt: new Date().toISOString(),
      },
      partial || {},
    );
  }

  function clickHost(host) {
    if (!host) return;
    var btn =
      (host.shadowRoot && host.shadowRoot.querySelector("button")) || host;
    btn.click();
  }

  test("note-editor empty state", async function () {
    await BP.require("notes/components/organisms/note-editor");
    var el = await mount("dimui-note-editor", { note: null });
    expect(el.shadowRoot.querySelector("dimui-empty-state")).toBeTruthy();
  });

  test("note-editor edit pin move trash confirm", async function () {
    await BP.require("notes/components/organisms/note-editor");
    var changed = null;
    var pinned = null;
    var moved = null;
    var trashed = null;
    var backed = 0;
    var el = await mount("dimui-note-editor", {
      note: note({ pinned: false }),
      folders: [
        { id: "f1", name: "Personal" },
        { id: "f2", name: "Work" },
      ],
      saveStatus: "Saved",
      showBack: true,
      onChange: function (n) {
        changed = n;
      },
      onBack: function () {
        backed += 1;
      },
      onTogglePin: function (id) {
        pinned = id;
      },
      onMoveFolder: function (id, folderId) {
        moved = { id: id, folderId: folderId };
      },
      onTrash: function (id) {
        trashed = id;
      },
    });

    expect(el.shadowRoot.querySelector(".save-status").textContent).toContain(
      "Saved",
    );
    var title = el.shadowRoot.querySelector(".title-input");
    title.value = "New title";
    title.dispatchEvent(new Event("input", { bubbles: true }));
    expect(changed && changed.title).toBe("New title");

    var body = el.shadowRoot.querySelector(".body-input");
    body.value = "New body";
    body.dispatchEvent(new Event("input", { bubbles: true }));
    expect(changed && changed.body).toBe("New body");

    var select = el.shadowRoot.querySelector(".folder-select");
    select.value = "f2";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    expect(moved && moved.folderId).toBe("f2");

    var icons = el.shadowRoot.querySelectorAll("dimui-icon-button");
    clickHost(icons[0]);
    expect(backed).toBe(1);
    clickHost(icons[1]);
    expect(pinned).toBe("n1");
    clickHost(icons[2]);
    await el.updateComplete;
    var dialog = el.shadowRoot.querySelector("dimui-confirm-dialog");
    expect(dialog).toBeTruthy();
    var confirmBtns = dialog.shadowRoot.querySelectorAll("dimui-button");
    clickHost(confirmBtns[1]);
    expect(trashed).toBe("n1");
  });

  test("note-editor trashed restore and delete forever", async function () {
    await BP.require("notes/components/organisms/note-editor");
    var restored = null;
    var deleted = null;
    var el = await mount("dimui-note-editor", {
      note: note({ trashed: true, pinned: false }),
      folders: [],
      onRestore: function (id) {
        restored = id;
      },
      onDeleteForever: function (id) {
        deleted = id;
      },
    });

    var icons = el.shadowRoot.querySelectorAll("dimui-icon-button");
    clickHost(icons[0]);
    expect(restored).toBe("n1");

    var danger = el.shadowRoot.querySelector("dimui-button");
    clickHost(danger);
    await el.updateComplete;
    var dialog = el.shadowRoot.querySelector("dimui-confirm-dialog");
    var confirmBtns = dialog.shadowRoot.querySelectorAll("dimui-button");
    clickHost(confirmBtns[0]);
    await el.updateComplete;
    clickHost(danger);
    await el.updateComplete;
    dialog = el.shadowRoot.querySelector("dimui-confirm-dialog");
    confirmBtns = dialog.shadowRoot.querySelectorAll("dimui-button");
    clickHost(confirmBtns[1]);
    expect(deleted).toBe("n1");
  });
})();
