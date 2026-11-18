BP.module(
  "notes/components/pages/notes-app",
  [
    "notes/lib/theme",
    "notes/lib/tokens",
    "notes/components/organisms/unlock-screen",
    "notes/components/organisms/notes-shell",
  ],
  function (theme, tokens, unlock, shell) {
    const { define, css } = Dim;
    const { notesTokens } = tokens;
    const { UnlockScreen } = unlock;
    const { NotesShell } = shell;
    const { getStoredTheme, subscribeExplorerTheme } = theme;

    const styles = css`
      ${notesTokens}

      :host {
        display: block;
        height: 100%;
        min-height: 0;
      }
    `;

    const NotesApp = define({
      tag: "dimui-notes-app",
      component: (
        _,
        {
          html: tpl,
          useState: state,
          useEffect: effect,
          useRef: ref,
          useScope: scope,
          useStyle: style,
        },
      ) => {
        style(styles);
        scope({ UnlockScreen, NotesShell });

        const [password, setPassword] = state(null);
        const [creating, setCreating] = state(false);
        const [error, setError] = state("");
        const [themeValue, setTheme] = state(getStoredTheme());
        const hostRef = ref();

        effect(() => subscribeExplorerTheme(setTheme), []);

        effect(() => {
          const host = hostRef.current;
          if (host?.setAttribute) host.setAttribute("data-theme", themeValue);
        }, [themeValue]);

        const unlockVault = (value, { create }) => {
          setError("");
          setCreating(Boolean(create));
          setPassword(value);
        };

        const lock = () => {
          setPassword(null);
          setCreating(false);
          setError("");
        };

        const unlockFailed = (message) => {
          setPassword(null);
          setCreating(false);
          setError(message || "Wrong password.");
        };

        if (!password) {
          return tpl`
            <dimui-unlock
              .props="${{ onUnlock: unlockVault, error, theme: themeValue }}"
            />
          `;
        }

        return tpl`
          <dimui-notes-shell
            .props="${{
              password,
              create: creating,
              onLock: lock,
              onUnlockFailed: unlockFailed,
              theme: themeValue,
            }}"
          />
        `;
      },
    });
    return { NotesApp };
  },
);
