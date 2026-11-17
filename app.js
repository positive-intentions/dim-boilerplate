/**
 * Local shell: header + runtime/theme toggles + local notes composition.
 * Classic script — uses global Dim and BP.require for local notes modules.
 * Dimui atoms / theme load from GitHub Pages via dimui/* BP deps.
 */
(function () {
  var Dim = globalThis.Dim;
  if (!Dim) {
    document.body.textContent =
      "Dim runtime missing. Open index.html so the remote Dim IIFE can load from Pages.";
    return;
  }
  if (!globalThis.BP) {
    document.body.textContent =
      "BP registry missing. Ensure runtime.js loads before the notes scripts.";
    return;
  }

  var define = Dim.define;
  var css = Dim.css;

  var shellStyles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      background: var(--dimui-doc-bg, #0f172a);
      color: var(--dimui-doc-text, #e2e8f0);
    }
    header.bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--dimui-doc-border, #334155);
      background: var(--dimui-doc-surface, #1e293b);
    }
    header.bar h1 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      flex: 1 1 auto;
    }
    header.bar .meta {
      font-size: 0.8rem;
      color: var(--dimui-doc-text-muted, #94a3b8);
    }
    header.bar button {
      appearance: none;
      border: 1px solid var(--dimui-doc-border, #334155);
      background: var(--dimui-doc-surface-2, #0b1220);
      color: var(--dimui-doc-text, #e2e8f0);
      border-radius: 6px;
      padding: 0.35rem 0.7rem;
      font: inherit;
      cursor: pointer;
    }
    header.bar button.active {
      border-color: var(--dimui-doc-primary, #029cfd);
      color: var(--dimui-doc-primary, #029cfd);
    }
    header.bar button:hover {
      background: var(--dimui-doc-surface-hover, #334155);
    }
    .body {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
    .body > * {
      flex: 1 1 auto;
      min-height: 0;
    }
    .error {
      margin: 1.5rem;
      padding: 1rem 1.25rem;
      border-radius: 8px;
      border: 1px solid var(--dimui-doc-danger, #ef4444);
      background: var(--dimui-doc-danger-bg, #7f1d1d);
      color: #fff;
      white-space: pre-wrap;
      font-family: ui-monospace, Menlo, monospace;
      font-size: 0.85rem;
    }
  `;

  function currentImpl() {
    return document.documentElement.dataset.dimRuntime || "js";
  }

  function setImpl(next) {
    var url = new URL(location.href);
    url.searchParams.set("impl", next);
    location.href = url.toString();
  }

  function dispatchTheme(theme) {
    try {
      localStorage.setItem("dimui-explorer-theme", theme);
    } catch (_) {}
    window.dispatchEvent(
      new CustomEvent("dimui-theme-change", { detail: { theme: theme } }),
    );
  }

  var bootError = null;
  var NotesApp = null;
  var themeApi = null;

  async function boot() {
    try {
      themeApi = await BP.require("notes/lib/theme");
      var notes = await BP.require("notes/components/pages/notes-app");
      NotesApp = notes.NotesApp;
      if (!NotesApp) {
        throw new Error("notes/components/pages/notes-app did not export NotesApp");
      }
      var initial =
        (themeApi.getStoredTheme && themeApi.getStoredTheme()) || "dark";
      if (themeApi.applyDocumentTheme) themeApi.applyDocumentTheme(initial);
      document.documentElement.style.height = "100%";
      document.body.style.margin = "0";
      document.body.style.minHeight = "100%";
    } catch (err) {
      bootError =
        "Failed to boot the local notes app.\n" +
        "Atoms and theme.js load from https://positive-intentions.github.io/dimui/\n" +
        "(needs network). Local notes modules use the BP registry.\n\n" +
        (err && (err.stack || err.message)
          ? err.stack || err.message
          : String(err));
      console.error(err);
    }

    define({
      tag: "boilerplate-app",
      component: function (_, hooks) {
        var tpl = hooks.html;
        var style = hooks.useStyle;
        var scope = hooks.useScope;
        var state = hooks.useState;
        var effect = hooks.useEffect;

        style(shellStyles);

        var themeState = state(
          (themeApi && themeApi.getStoredTheme && themeApi.getStoredTheme()) ||
            "dark",
        );
        var theme = themeState[0];
        var setTheme = themeState[1];
        var impl = currentImpl();

        if (NotesApp) {
          scope({ NotesApp: NotesApp });
        }

        effect(function () {
          if (themeApi && themeApi.applyDocumentTheme) {
            themeApi.applyDocumentTheme(theme);
          }
          dispatchTheme(theme);
        }, [theme]);

        effect(function () {
          if (!themeApi || !themeApi.subscribeExplorerTheme) return;
          return themeApi.subscribeExplorerTheme(function (next) {
            setTheme(next);
          });
        }, []);

        if (bootError) {
          return tpl`<div class="error" role="alert">${bootError}</div>`;
        }

        return tpl`
          <header class="bar">
            <h1>dim-boilerplate — encrypted notes</h1>
            <span class="meta">runtime: ${impl}</span>
            <button
              type="button"
              class="${impl === "js" ? "active" : ""}"
              @click="${function () {
                setImpl("js");
              }}"
            >
              JS
            </button>
            <button
              type="button"
              class="${impl === "wasm" ? "active" : ""}"
              @click="${function () {
                setImpl("wasm");
              }}"
            >
              WASM
            </button>
            <button
              type="button"
              @click="${function () {
                setTheme(theme === "light" ? "dark" : "light");
              }}"
            >
              ${theme === "light" ? "Dark" : "Light"}
            </button>
          </header>
          <div class="body">
            <dimui-notes-app />
          </div>
        `;
      },
    });
  }

  boot();
})();
