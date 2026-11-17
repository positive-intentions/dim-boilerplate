/**
 * Registers the service worker (HTTPS / localhost only) and harvests loaded
 * Dim / dimui resource URLs so the worker can cache them for offline use.
 * No-ops on file:// where service workers are unavailable.
 */
(function () {
  if (!("serviceWorker" in navigator)) return;
  if (location.protocol === "file:") return;

  var CDN_ORIGIN = "https://positive-intentions.github.io";

  function isHarvestable(url) {
    if (!url || typeof url !== "string") return false;
    if (url.indexOf(CDN_ORIGIN + "/dim/") === 0) return true;
    if (url.indexOf(CDN_ORIGIN + "/dimui/") === 0) return true;
    // Proxy paths under this app (later visits)
    if (url.indexOf("/pwa/cdn/dim/") !== -1) return true;
    if (url.indexOf("/pwa/cdn/dimui/") !== -1) return true;
    return false;
  }

  function collectLoadedUrls() {
    var seen = Object.create(null);
    var out = [];

    function add(url) {
      if (!isHarvestable(url) || seen[url]) return;
      seen[url] = true;
      out.push(url);
    }

    try {
      var entries = performance.getEntriesByType("resource");
      for (var i = 0; i < entries.length; i++) {
        add(entries[i].name);
      }
    } catch (e) {}

    try {
      var scripts = document.getElementsByTagName("script");
      for (var j = 0; j < scripts.length; j++) {
        if (scripts[j].src) add(scripts[j].src);
      }
    } catch (e) {}

    return out;
  }

  function postCacheUrls(worker) {
    var urls = collectLoadedUrls();
    if (!urls.length || !worker) return;
    worker.postMessage({ type: "CACHE_URLS", urls: urls });
  }

  function scheduleHarvest(registration) {
    function send() {
      var worker =
        (registration && registration.active) ||
        navigator.serviceWorker.controller;
      postCacheUrls(worker);
    }

    if (document.readyState === "complete") {
      // Give dimui dynamic imports a moment to finish.
      setTimeout(send, 1500);
    } else {
      window.addEventListener("load", function () {
        setTimeout(send, 1500);
      });
    }
  }

  navigator.serviceWorker
    .register("./sw.js")
    .then(function (registration) {
      scheduleHarvest(registration);
      // When a new worker takes control, harvest again under proxy URLs.
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        scheduleHarvest(registration);
      });
    })
    .catch(function (err) {
      console.warn("[pwa] service worker registration failed:", err);
    });
})();
