/**
 * Runs after the inline index.html script has sync-loaded window.Dim
 * from https://positive-intentions.github.io/dim/lib/dim*.global.js.
 *
 * 1. Installs an import map so remote dimui ESM resolves
 *    `@positive-intentions/dim` to a data: shim over globalThis.Dim.
 * 2. Exposes globalThis.BP — a tiny AMD-style module registry used by the
 *    local classic-script notes components (local ES modules are blocked on
 *    file:// in Chrome).
 *
 * Remote atoms / theme load via absolute https:// import() when a BP dep
 * starts with "dimui/" (e.g. "dimui/components/atoms/button").
 * Dim itself is a classic remote IIFE (not import()) so window.Dim exists
 * before this shim is built.
 */
(function () {
  var CDN_DIMUI_SRC = "https://positive-intentions.github.io/dimui/src/";
  var CDN_DIM_LIB = "https://positive-intentions.github.io/dim/lib/";
  // When a service worker already controls the page, route Dim/dimui through
  // same-scope proxy paths so the worker can intercept and serve them offline.
  var controlled =
    typeof navigator !== "undefined" &&
    navigator.serviceWorker &&
    navigator.serviceWorker.controller;
  var DIMUI_SRC = controlled ? "./pwa/cdn/dimui/src/" : CDN_DIMUI_SRC;
  var DIM_LIB = controlled ? "./pwa/cdn/dim/lib/" : CDN_DIM_LIB;

  if (!globalThis.Dim) {
    throw new Error(
      "Dim global missing. The inline script in index.html should have loaded " +
        CDN_DIM_LIB +
        "dim.global.js (or dim.wasm.global.js).",
    );
  }

  var keys = Object.keys(globalThis.Dim).join(",");
  var shim = "const D=globalThis.Dim;export const{" + keys + "}=D;";
  var map = {
    imports: {
      "@positive-intentions/dim":
        "data:text/javascript," + encodeURIComponent(shim),
      "dimui/": DIMUI_SRC,
    },
  };

  var importMap = document.createElement("script");
  importMap.type = "importmap";
  importMap.textContent = JSON.stringify(map);
  var scriptEl = document.currentScript;
  if (scriptEl && scriptEl.parentNode) {
    scriptEl.after(importMap);
  } else {
    (document.head || document.documentElement).appendChild(importMap);
  }

  globalThis.__DIM_BOILERPLATE__ = {
    impl: document.documentElement.dataset.dimRuntime || "js",
    dimuiSrc: DIMUI_SRC,
    dimLib: DIM_LIB,
    pwaControlled: !!controlled,
  };

  // -------------------------------------------------------------------------
  // BP module registry
  // -------------------------------------------------------------------------

  var registry = Object.create(null);
  var cache = Object.create(null);

  function loadDimuiRemote(name) {
    // "dimui/theme" → theme.js
    // "dimui/components/atoms/button" → components/atoms/button.js
    var path = name.slice("dimui/".length);
    if (!path) {
      return Promise.reject(new Error('Invalid dimui module id "' + name + '"'));
    }
    var url = DIMUI_SRC + path + ".js";
    return import(url).catch(function (err) {
      return Promise.reject(
        new Error(
          "Failed to load " +
            name +
            " from " +
            url +
            "\n" +
            (err && err.message ? err.message : String(err)),
        ),
      );
    });
  }

  function resolve(name) {
    if (cache[name]) return cache[name];

    if (name.indexOf("dimui/") === 0) {
      cache[name] = loadDimuiRemote(name).catch(function (err) {
        delete cache[name];
        return Promise.reject(err);
      });
      return cache[name];
    }

    var entry = registry[name];
    if (!entry) {
      return Promise.reject(
        new Error('BP module "' + name + '" is not registered'),
      );
    }

    cache[name] = Promise.all(
      entry.deps.map(function (dep) {
        return resolve(dep);
      }),
    )
      .then(function (args) {
        return entry.factory.apply(null, args);
      })
      .catch(function (err) {
        delete cache[name];
        throw err;
      });

    return cache[name];
  }

  globalThis.BP = {
    /**
     * Register a classic-script module.
     * @param {string} name
     * @param {string[]} deps
     * @param {(...exports: any) => any} factory
     */
    module: function (name, deps, factory) {
      if (typeof deps === "function") {
        factory = deps;
        deps = [];
      }
      registry[name] = { deps: deps || [], factory: factory };
      // Invalidate a prior resolve so late registration still works if
      // something required the name before its script ran (shouldn't happen
      // with the script order in index.html, but keep the door open).
      delete cache[name];
    },

    /** @param {string} name @returns {Promise<any>} */
    require: function (name) {
      return resolve(name);
    },
  };
})();
