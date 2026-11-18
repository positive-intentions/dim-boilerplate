/**
 * Proxy for remote NavigationView — see dimui dimui/components/notes/organisms/navigation-view
 */
BP.module(
  "notes/components/organisms/navigation-view",
  ["dimui/components/notes/organisms/navigation-view"],
  function (mod) {
    return { NavigationView: mod.NavigationView };
  },
);
