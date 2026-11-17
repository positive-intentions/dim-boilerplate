<p align="center">
  <img src="public/dim.png" alt="Dim Framework Logo" width="200" />
</p>

<h1 align="center">dim-boilerplate</h1>

<p align="center">
  <strong>Encrypted notes demo for building with Dim — plain JavaScript</strong>
</p>

<p align="center">
  No app-side transpile, no npm install, no bundler. Open
  <a href="./index.html"><code>index.html</code></a> in Chrome or use the live site.
</p>

<div align="center">
  
[**Live Demo**](https://positive-intentions.github.io/dim-boilerplate/) | [**dim**](https://github.com/positive-intentions/dim) | [**dimui**](https://github.com/positive-intentions/dimui)

</div>

<div align="center">
  
![GitHub stars](https://img.shields.io/github/stars/positive-intentions/dim-boilerplate?style=social) 
![GitHub forks](https://img.shields.io/github/forks/positive-intentions/dim-boilerplate?style=social) 
![GitHub issues](https://img.shields.io/github/issues/positive-intentions/dim-boilerplate) 
![npm](https://img.shields.io/npm/v/@positive-intentions/dim)
![License](https://img.shields.io/badge/License-GPLv3-blue.svg)
![Deploy](https://github.com/positive-intentions/dim-boilerplate/actions/workflows/deploy-pages.yml/badge.svg)
[![gh-pages-build-deployment](https://github.com/positive-intentions/dim-boilerplate/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/positive-intentions/dim-boilerplate/actions/workflows/pages/pages-build-deployment)

</div>

---

Your **application logic** is ordinary `.js` files in this repo. The Dim
runtime and reusable [dimui](https://github.com/positive-intentions/dimui)
widgets load from their GitHub Pages CDNs over the network.

## Dim in 30 seconds

Dim is a small framework: functional components + hooks, registered as **web
components**. Hooks come from the second argument of your component function
(not only from top-level imports).

```js
const { define } = Dim;

const Counter = define({
  tag: "demo-counter",
  component: (props, { html, useState }) => {
    const [count, setCount] = useState(0);
    return html`
      <button @click="${() => setCount(count + 1)}">
        Count: ${count}
      </button>
    `;
  },
});

// Then mount: <demo-counter></demo-counter>
```

That’s the core loop: `define` → `html` template → `useState` (and friends).
For effects, styling, encrypted `useStore`, and more, see the
[dim](https://github.com/positive-intentions/dim) README and docs.

## The three pieces

| Piece | Repo | Job here |
| ----- | ---- | -------- |
| **Framework** | [dim](https://github.com/positive-intentions/dim) | `define`, `html`, hooks — classic IIFE → `window.Dim` |
| **Shared UI** | [dimui](https://github.com/positive-intentions/dimui) | Atoms (Button, Icon, …) as unbundled ESM on Pages |
| **This app** | dim-boilerplate | Notes vault, folders, list/editor — **your** pure JS |

```mermaid
flowchart LR
  App[dim-boilerplate pure JS app]
  DimRuntime[dim runtime CDN]
  DimuiCdn[dimui components CDN]
  App -->|"define / html / hooks"| DimRuntime
  App -->|"BP proxies pull atoms"| DimuiCdn
  DimuiCdn -->|"import map → window.Dim"| DimRuntime
```

dimui is pulled **by URL at runtime** (one file per component). Local
`notes/components/atoms/*.js` files are thin **proxies** so opening
`button.js` shows it re-exports dimui’s Button — app code never npm-installs
dimui.

## How this app boots

```mermaid
flowchart TD
  html[index.html]
  dimIife["Remote Dim IIFE → window.Dim"]
  runtime["runtime.js: import map + BP registry"]
  modules["notes/**/*.js register via BP.module"]
  app["app.js BP.require notes page"]
  html --> dimIife
  html --> runtime
  html --> modules
  html --> app
  dimIife --> runtime
  runtime --> modules
  modules --> app
```

1. `index.html` sync-loads Dim from
   `https://positive-intentions.github.io/dim/lib/` (JS or WASM via `?impl=`).
2. [`runtime.js`](./runtime.js) adds an import map so remote dimui ESM can use
   `@positive-intentions/dim` against `globalThis.Dim`, and exposes
   `globalThis.BP` for local classic scripts (`file://` cannot use local ESM).
3. Each file under `notes/` calls `BP.module(...)`.
4. [`app.js`](./app.js) does `BP.require("notes/components/pages/notes-app")`
   and renders the notes UI.

## Where to look in the tree

```
dim-boilerplate/
├── index.html              # loads Dim + all classic scripts + PWA meta
├── runtime.js              # import map + BP + dimui/* resolver
├── app.js                  # host chrome (JS/WASM + theme toggles)
├── pwa.js                  # SW register + CDN harvest + install prompt API
├── sw.js                   # precache + stale-while-revalidate + CDN proxy
├── manifest.webmanifest    # installable app metadata (+ screenshots)
├── public/                 # README logo (dim.png)
├── icons/                  # 192 / 512 / maskable / SVG PWA icons
├── screenshots/            # narrow + wide images for richer install UI
└── notes/
    ├── lib/         # vault helpers, tokens, seed data
    └── components/
        ├── atoms/       # proxies → remote dimui
        ├── molecules/   # note-item, confirm-dialog, …
        ├── organisms/   # list, editor, shell, unlock
        ├── templates/   # notes-layout
        └── pages/       # notes-app (password gate)
```

Start at [`notes/components/pages/notes-app.js`](./notes/components/pages/notes-app.js)
(unlock vs vault), then
[`notes/components/organisms/notes-shell.js`](./notes/components/organisms/notes-shell.js)
(encrypted `useStore` + folders). Folder rows and editors are local pure JS;
buttons/icons come through atom proxies.

## Quick start

1. Clone this repo.
2. Open `index.html` in Chrome (network required for Dim + dimui).
3. Create a vault password, add notes, lock / unlock.

Runtimes: `?impl=js` or `?impl=wasm` (also in the header). Choice is stored in
`localStorage`.

## PWA / offline

On **HTTPS** or **localhost** (not `file://`, and not typical LAN
`http://192.168.x.x`):

1. First visit loads Dim + dimui from their GitHub Pages CDNs and registers
   [`sw.js`](./sw.js). The worker precaches this app’s shell and harvests the
   CDN URLs that actually loaded.
2. Later visits (even without installing) are controlled by the service
   worker. Dim/dimui are requested via same-scope `./pwa/cdn/...` paths so the
   worker can intercept them, serve the cache immediately, and revalidate in
   the background (stale-while-revalidate).
3. Offline after that first visit: the notes UI boots from cache. Encrypted
   vault data still lives in IndexedDB as before.

### Install

[`manifest.webmanifest`](./manifest.webmanifest) makes the app installable
(standalone display, icons, screenshots). Chrome does **not** always show an
automatic banner: it waits for engagement heuristics (about **30 seconds** on
the page plus at least one tap) and may hide the mini-infobar if the user
dismissed it earlier.

This app surfaces install explicitly:

- **Android / desktop Chromium** — after the criteria are met,
  `beforeinstallprompt` enables an **Install** button in the header. Tapping
  it opens the system install dialog. The button is hidden in standalone /
  already-installed mode.
- **iOS Safari** — there is no install prompt API. A short tip points to
  **Share → Add to Home Screen** (meta tags + apple-touch-icon are already
  set).
- **Insecure context** — service workers and installability need HTTPS or
  localhost. Opening via `file://` or a plain HTTP LAN IP will not register
  the worker or fire `beforeinstallprompt`.

`file://` cannot use service workers — double-clicking `index.html` still
needs network for Dim + dimui. Use a local static server
(`npx serve .` / `python -m http.server`) on localhost, or the live Pages
URL, to exercise the PWA path.

## Deploy

Published from **`staging`** with no build step
([`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml)):

https://positive-intentions.github.io/dim-boilerplate/

Same files as on disk — Pages is just another host (including `sw.js`,
`pwa.js`, `manifest.webmanifest`, and `icons/`).

## Adding a component

1. **Shared atom** — proxy under `notes/components/atoms/` depending on
   `dimui/components/atoms/<name>`, plus a `<script>` in `index.html`.
2. **App UI** — one `define()` per file under molecules / organisms / templates /
   pages; register with `BP.module("notes/components/...", deps, factory)`.
3. Depend on local module ids (e.g. `notes/components/atoms/button`), not a
   grab-bag `"dimui"` name.

In Dim `html\`...\`` templates, childless custom elements may use
`<dimui-icon .props="${{ name: "plus" }}" />`. Do **not** use `/>` in raw
`index.html` — the browser won’t treat custom elements as void.

## Caveats

- First HTTPS/localhost visit still needs network for Dim and dimui CDNs;
  later visits can run offline via the service worker (nothing vendored into
  this repo).
- CDN builds track dim / dimui Pages deploys (`staging` for dimui).
- Local `notes/` tracks
  [dimui’s notes demo](https://github.com/positive-intentions/dimui/tree/staging/src/demos/notes);
  re-sync manually when that demo changes.
- On `file://`, IndexedDB is shared across local HTML files in Chrome; service
  workers do not run on `file://`.
- Strict CSP: allow `'wasm-unsafe-eval'` for WASM Dim and `data:` for the Dim
  import-map shim.

## Related

- [dim](https://github.com/positive-intentions/dim) — framework
- [dimui](https://github.com/positive-intentions/dimui) — component explorer + atoms
- Live demo: https://positive-intentions.github.io/dim-boilerplate/
