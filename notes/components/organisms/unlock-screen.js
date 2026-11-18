/**
 * Proxy for remote dimui UnlockScreen — see dimui/src/components/molecules/unlock-screen.js
 * App-specific title/copy are applied by notes-app when mounting.
 */
BP.module(
  "notes/components/organisms/unlock-screen",
  ["dimui/components/molecules/unlock-screen"],
  function (mod) {
    return { UnlockScreen: mod.UnlockScreen };
  },
);
