/**
 * Shared helpers for DimTest iframe e2e specs (classic script).
 * Exposes globalThis.DimE2E.
 */
(function (global) {
  "use strict";

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function openApp(opts) {
    opts = opts || {};
    return DimTest.open("./index.html", {
      ready: opts.ready || "boilerplate-app",
      timeout: opts.timeout || 60000,
      cover: opts.cover,
      visible: opts.visible,
    });
  }

  function waitShellReady(page, timeoutMs) {
    return page.wait("dimui-notes-shell", timeoutMs || 30000).then(function () {
      return page.wait(function () {
        var shell = page.query("dimui-notes-shell");
        if (!shell) return null;
        var t = page.text(shell);
        if (t.indexOf("Decrypting") >= 0 || t.indexOf("Opening vault") >= 0) {
          return null;
        }
        return page.query("dimui-notes-layout") || null;
      }, timeoutMs || 30000);
    });
  }

  function createVault(page, password) {
    var pass = password || "pass1234";
    return page.wait("dimui-unlock", 30000).then(function () {
      var fields = page.queryAll("dimui-text-field");
      if (fields.length < 2) {
        throw new Error("DimE2E.createVault: expected create-password fields");
      }
      return page
        .fill(fields[0], pass)
        .then(function () {
          return page.fill(fields[1], pass);
        })
        .then(function () {
          return page.click("dimui-button");
        })
        .then(function () {
          return waitShellReady(page);
        });
    });
  }

  function unlockVault(page, password) {
    var pass = password || "pass1234";
    return page.wait("dimui-unlock", 30000).then(function () {
      var fields = page.queryAll("dimui-text-field");
      if (!fields.length) {
        throw new Error("DimE2E.unlockVault: password field missing");
      }
      return page
        .fill(fields[0], pass)
        .then(function () {
          return page.click("dimui-button");
        })
        .then(function () {
          return waitShellReady(page);
        });
    });
  }

  function lockVault(page) {
    var header = page.query("dimui-notes-header");
    if (!header || !header.shadowRoot) {
      return Promise.reject(new Error("DimE2E.lockVault: header missing"));
    }
    var lockBtn = header.shadowRoot.querySelector("dimui-icon-button");
    if (!lockBtn) {
      return Promise.reject(new Error("DimE2E.lockVault: lock button missing"));
    }
    return page.click(lockBtn).then(function () {
      return page.wait("dimui-unlock", 30000);
    });
  }

  function clickFolderByName(page, name) {
    var re = name instanceof RegExp ? name : new RegExp(name, "i");
    var items = page.queryAll("dimui-folder-item");
    for (var i = 0; i < items.length; i++) {
      if (re.test(page.text(items[i]))) {
        return page.click(items[i]);
      }
    }
    return Promise.reject(
      new Error("DimE2E.clickFolderByName: no folder matching " + name),
    );
  }

  function clickFab(page) {
    var fab = page.query("dimui-fab");
    if (!fab) return Promise.reject(new Error("DimE2E.clickFab: fab missing"));
    return page.click(fab).then(function () {
      return page.wait(function () {
        var editor = page.query("dimui-note-editor");
        if (!editor || !editor.shadowRoot) return null;
        return editor.shadowRoot.querySelector(".title-input");
      }, 15000);
    });
  }

  function openFirstNote(page) {
    return page.wait(function () {
      return page.query("dimui-note-item");
    }, 20000).then(function (item) {
      return page.click(item).then(function () {
        return page.wait(function () {
          var editor = page.query("dimui-note-editor");
          if (!editor || !editor.shadowRoot) return null;
          return editor.shadowRoot.querySelector(".title-input");
        }, 15000);
      });
    });
  }

  function setNativeValue(el, value) {
    // Use the element's realm (iframe window) — parent HTMLInputElement
    // setters throw Illegal invocation across documents.
    var view =
      (el.ownerDocument && el.ownerDocument.defaultView) || global;
    var isArea =
      el.tagName && String(el.tagName).toUpperCase() === "TEXTAREA";
    var proto = isArea
      ? view.HTMLTextAreaElement.prototype
      : view.HTMLInputElement.prototype;
    var desc = Object.getOwnPropertyDescriptor(proto, "value");
    var next = value == null ? "" : String(value);
    if (desc && desc.set) desc.set.call(el, next);
    else el.value = next;
    el.dispatchEvent(new view.Event("input", { bubbles: true }));
    el.dispatchEvent(new view.Event("change", { bubbles: true }));
  }

  function fillNoteEditor(page, title, body) {
    var editor = page.query("dimui-note-editor");
    if (!editor || !editor.shadowRoot) {
      return Promise.reject(new Error("DimE2E.fillNoteEditor: editor missing"));
    }
    var titleEl = editor.shadowRoot.querySelector(".title-input");
    var bodyEl = editor.shadowRoot.querySelector(".body-input");
    if (!titleEl || !bodyEl) {
      return Promise.reject(new Error("DimE2E.fillNoteEditor: inputs missing"));
    }
    // Flush between fields — patch() spreads `note` from the last render;
    // firing title+body in the same turn lets the body update clobber title.
    setNativeValue(titleEl, title);
    return flushEditor(editor)
      .then(function () {
        editor = page.query("dimui-note-editor");
        bodyEl =
          editor &&
          editor.shadowRoot &&
          editor.shadowRoot.querySelector(".body-input");
        if (!bodyEl) {
          throw new Error("DimE2E.fillNoteEditor: body input missing after title");
        }
        setNativeValue(bodyEl, body);
        return flushEditor(editor);
      })
      .then(function () {
        return page.wait(function () {
          var ed = page.query("dimui-note-editor");
          var input =
            ed && ed.shadowRoot && ed.shadowRoot.querySelector(".title-input");
          return input && input.value === String(title || "") ? input : null;
        }, 10000);
      });
  }

  function flushEditor(editor) {
    var chain = Promise.resolve();
    if (editor && editor.updateComplete) {
      chain = chain.then(function () {
        return editor.updateComplete;
      });
    }
    return chain
      .then(function () {
        return sleep(0);
      })
      .then(function () {
        return new Promise(function (resolve) {
          requestAnimationFrame(function () {
            requestAnimationFrame(resolve);
          });
        });
      })
      .then(function () {
        // Persist debounce in shell is ~300ms+.
        return sleep(500);
      });
  }

  function clickEditorAction(page, labelRe) {
    var editor = page.query("dimui-note-editor");
    if (!editor || !editor.shadowRoot) {
      return Promise.reject(new Error("DimE2E.clickEditorAction: editor missing"));
    }
    var icons = editor.shadowRoot.querySelectorAll("dimui-icon-button");
    for (var i = 0; i < icons.length; i++) {
      var btn =
        icons[i].shadowRoot && icons[i].shadowRoot.querySelector("button");
      var al = (btn && btn.getAttribute("aria-label")) || "";
      if (labelRe.test(al)) {
        return page.click(icons[i]);
      }
    }
    return Promise.reject(
      new Error("DimE2E.clickEditorAction: no button matching " + labelRe),
    );
  }

  function confirmDialog(page, hostSelector) {
    return page
      .wait(function () {
        var host = hostSelector
          ? page.query(hostSelector)
          : page.query("dimui-note-editor") || page.query("dimui-notes-layout");
        if (!host || !host.shadowRoot) return null;
        return host.shadowRoot.querySelector("dimui-confirm-dialog");
      }, 10000)
      .then(function (dialog) {
        var buttons =
          dialog.shadowRoot &&
          dialog.shadowRoot.querySelectorAll("dimui-button");
        if (!buttons || buttons.length < 2) {
          throw new Error("DimE2E.confirmDialog: action button missing");
        }
        // Cancel is usually first; confirm/action second (matches unit tests).
        return page.click(buttons[1]);
      });
  }

  function fillSearch(page, value) {
    var search = page.query("dimui-search-field");
    if (!search) {
      // Fallback: search may be a dimui-text-field inside list header.
      var fields = page.queryAll("dimui-text-field");
      for (var i = 0; i < fields.length; i++) {
        var t = page.text(fields[i]);
        if (/search/i.test(t) || fields[i].shadowRoot) {
          return page.fill(fields[i], value);
        }
      }
      return Promise.reject(new Error("DimE2E.fillSearch: search field missing"));
    }
    return page.fill(search, value);
  }

  function clickThemeToggle(page) {
    var app = page.query("boilerplate-app");
    if (!app || !app.shadowRoot) {
      return Promise.reject(new Error("DimE2E.clickThemeToggle: app missing"));
    }
    var buttons = app.shadowRoot.querySelectorAll("header.bar button");
    for (var i = 0; i < buttons.length; i++) {
      var label = (buttons[i].textContent || "").trim();
      if (label === "Light" || label === "Dark") {
        buttons[i].click();
        return sleep(50).then(function () {
          return label;
        });
      }
    }
    return Promise.reject(new Error("DimE2E.clickThemeToggle: theme button missing"));
  }

  function notesTheme(page) {
    var hosts = [
      page.query("dimui-notes-layout"),
      page.query("dimui-notes-shell"),
      page.query("dimui-unlock"),
      page.query("dimui-notes-app"),
    ];
    for (var i = 0; i < hosts.length; i++) {
      var host = hosts[i];
      if (!host) continue;
      var fromHost = host.getAttribute && host.getAttribute("data-theme");
      if (fromHost) return fromHost;
      var frame =
        host.shadowRoot && host.shadowRoot.querySelector("[data-theme]");
      if (frame) return frame.getAttribute("data-theme");
    }
    return null;
  }

  global.DimE2E = {
    sleep: sleep,
    openApp: openApp,
    waitShellReady: waitShellReady,
    createVault: createVault,
    unlockVault: unlockVault,
    lockVault: lockVault,
    clickFolderByName: clickFolderByName,
    clickFab: clickFab,
    openFirstNote: openFirstNote,
    fillNoteEditor: fillNoteEditor,
    clickEditorAction: clickEditorAction,
    confirmDialog: confirmDialog,
    fillSearch: fillSearch,
    clickThemeToggle: clickThemeToggle,
    notesTheme: notesTheme,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
