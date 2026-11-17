/**
 * Service worker for dim-boilerplate.
 *
 * - Precaches the local app shell on install.
 * - Stale-while-revalidate for in-scope GETs.
 * - Proxies ./pwa/cdn/{dim|dimui}/... to the GitHub Pages CDNs so Dim/dimui
 *   stay interceptable under this app's scope (no changes to those repos).
 * - Accepts CACHE_URLS messages so the first visit can harvest whatever
 *   Dim/dimui modules actually loaded.
 *
 * Note: requests to /dim/ and /dimui/ are outside this worker's scope, so they
 * are never intercepted directly — only via the proxy path or CACHE_URLS.
 */
/* eslint-disable no-restricted-globals */
(function () {
  var CACHE_VERSION = "dim-boilerplate-v2";
  var CDN_ORIGIN = "https://positive-intentions.github.io";
  var CDN_PREFIXES = {
    dim: CDN_ORIGIN + "/dim/",
    dimui: CDN_ORIGIN + "/dimui/",
  };

  var APP_SHELL = [
    "./",
    "./index.html",
    "./runtime.js",
    "./app.js",
    "./pwa.js",
    "./manifest.webmanifest",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/icon.svg",
    "./notes/lib/vault.js",
    "./notes/lib/tokens.js",
    "./notes/lib/theme.js",
    "./notes/lib/mockData.js",
    "./notes/lib/sharedKeys.js",
    "./notes/lib/note-filters.js",
    "./notes/components/atoms/button.js",
    "./notes/components/atoms/icon.js",
    "./notes/components/atoms/icon-button.js",
    "./notes/components/atoms/chip.js",
    "./notes/components/atoms/text-field.js",
    "./notes/components/atoms/empty-state.js",
    "./notes/components/atoms/fab.js",
    "./notes/components/molecules/search-field.js",
    "./notes/components/molecules/confirm-dialog.js",
    "./notes/components/molecules/folder-item.js",
    "./notes/components/molecules/mobile-folder-bar.js",
    "./notes/components/molecules/notes-header.js",
    "./notes/components/molecules/note-item.js",
    "./notes/components/organisms/folder-rail.js",
    "./notes/components/organisms/unlock-screen.js",
    "./notes/components/organisms/note-list.js",
    "./notes/components/organisms/note-editor.js",
    "./notes/components/organisms/navigation-view.js",
    "./notes/components/organisms/notes-shell.js",
    "./notes/components/templates/notes-layout.js",
    "./notes/components/pages/notes-app.js",
  ];

  function toAbsolute(relative) {
    return new URL(relative, self.registration.scope).href;
  }

  function proxyPathToCdn(pathname) {
    var marker = "pwa/cdn/";
    var idx = pathname.indexOf(marker);
    if (idx === -1) return null;
    var rest = pathname.slice(idx + marker.length); // "dim/lib/dim.global.js"
    var slash = rest.indexOf("/");
    if (slash === -1) return null;
    var repo = rest.slice(0, slash);
    var path = rest.slice(slash + 1);
    var base = CDN_PREFIXES[repo];
    if (!base) return null;
    return base + path;
  }

  function cdnUrlToProxy(cdnUrl) {
    var url;
    try {
      url = new URL(cdnUrl);
    } catch (e) {
      return null;
    }
    if (url.origin !== CDN_ORIGIN) return null;
    var path = url.pathname;
    if (path.indexOf("/dim/") === 0) {
      return toAbsolute("./pwa/cdn/dim/" + path.slice("/dim/".length));
    }
    if (path.indexOf("/dimui/") === 0) {
      return toAbsolute("./pwa/cdn/dimui/" + path.slice("/dimui/".length));
    }
    return null;
  }

  function isAllowedCdn(urlString) {
    return (
      urlString.indexOf(CDN_PREFIXES.dim) === 0 ||
      urlString.indexOf(CDN_PREFIXES.dimui) === 0
    );
  }

  function matchCached(cache, primary, secondary) {
    return cache.match(primary).then(function (hit) {
      if (hit) return hit;
      if (!secondary || secondary === primary) return null;
      return cache.match(secondary);
    });
  }

  /**
   * Re-wrap a CDN response so response.url is empty. Returning the raw CDN
   * Response makes ESM relative imports resolve against the CDN URL (outside
   * SW scope). A constructed Response keeps imports on the proxy request URL.
   */
  function asSameOriginResponse(response) {
    if (!response) return response;
    var headers = new Headers(response.headers);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    });
  }

  function staleWhileRevalidate(fetchRequest, cacheKeys, opts) {
    var keys = cacheKeys || [fetchRequest];
    var primary = keys[0];
    var secondary = keys[1];
    var wrapForProxy = opts && opts.wrapForProxy;

    return caches.open(CACHE_VERSION).then(function (cache) {
      return matchCached(cache, primary, secondary).then(function (cached) {
        var network = fetch(fetchRequest)
          .then(function (response) {
            if (response && response.ok) {
              var toStore = wrapForProxy
                ? asSameOriginResponse(response.clone())
                : response.clone();
              var puts = [cache.put(primary, toStore.clone())];
              if (secondary && secondary !== primary) {
                puts.push(cache.put(secondary, response.clone()));
              }
              if (
                typeof fetchRequest === "object" &&
                fetchRequest.url &&
                fetchRequest.url !==
                  (typeof primary === "string" ? primary : primary.url)
              ) {
                puts.push(cache.put(fetchRequest.url, response.clone()));
              }
              return Promise.all(puts).then(function () {
                return wrapForProxy ? asSameOriginResponse(response) : response;
              });
            }
            return response;
          })
          .catch(function () {
            return null;
          });

        if (cached) {
          network.then(function () {});
          // Cached proxy entries should already be same-origin wrappers.
          return wrapForProxy && cached.url && cached.url.indexOf(CDN_ORIGIN) === 0
            ? asSameOriginResponse(cached)
            : cached;
        }

        return network.then(function (response) {
          if (response) return response;
          if (
            typeof fetchRequest === "object" &&
            fetchRequest.mode === "navigate"
          ) {
            return cache
              .match(toAbsolute("./index.html"))
              .then(function (page) {
                return page || Response.error();
              });
          }
          return Response.error();
        });
      });
    });
  }

  self.addEventListener("install", function (event) {
    event.waitUntil(
      caches
        .open(CACHE_VERSION)
        .then(function (cache) {
          return cache.addAll(
            APP_SHELL.map(function (path) {
              return toAbsolute(path);
            }),
          );
        })
        .then(function () {
          return self.skipWaiting();
        }),
    );
  });

  self.addEventListener("activate", function (event) {
    event.waitUntil(
      caches
        .keys()
        .then(function (keys) {
          return Promise.all(
            keys.map(function (key) {
              if (key !== CACHE_VERSION) return caches.delete(key);
            }),
          );
        })
        .then(function () {
          return self.clients.claim();
        }),
    );
  });

  self.addEventListener("fetch", function (event) {
    var request = event.request;
    if (request.method !== "GET") return;

    var url = new URL(request.url);
    var scope = self.registration.scope;
    var scopeUrl = new URL(scope);

    if (url.origin !== scopeUrl.origin || url.href.indexOf(scope) !== 0) {
      return;
    }

    var cdnTarget = proxyPathToCdn(url.pathname);
    if (cdnTarget) {
      event.respondWith(
        staleWhileRevalidate(
          new Request(cdnTarget, { mode: "cors" }),
          [request, cdnTarget],
          { wrapForProxy: true },
        ),
      );
      return;
    }

    event.respondWith(staleWhileRevalidate(request, [request]));
  });

  self.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.type !== "CACHE_URLS" || !Array.isArray(data.urls)) {
      return;
    }

    event.waitUntil(
      caches.open(CACHE_VERSION).then(function (cache) {
        return Promise.all(
          data.urls.map(function (raw) {
            if (typeof raw !== "string" || !isAllowedCdn(raw)) return null;

            return fetch(raw, { mode: "cors" })
              .then(function (response) {
                if (!response || !response.ok) return;
                var puts = [cache.put(raw, response.clone())];
                var proxyUrl = cdnUrlToProxy(raw);
                if (proxyUrl) {
                  // Store a same-origin wrapper under the proxy key so later
                  // ESM relative imports stay inside SW scope.
                  puts.push(
                    cache.put(proxyUrl, asSameOriginResponse(response.clone())),
                  );
                }
                return Promise.all(puts);
              })
              .catch(function () {
                return null;
              });
          }),
        );
      }),
    );
  });
})();
