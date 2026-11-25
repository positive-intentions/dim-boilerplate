BP.module(
  "notes/components/pages/notes-app",
  [
    "notes/lib/theme",
    "notes/lib/tokens",
    "notes/lib/notes-app-logic",
    "notes/components/organisms/unlock-screen",
    "notes/components/organisms/notes-shell",
  ],
  function (theme, tokens, logic, unlock, shell) {
    const { define, css, t } = Dim;
    const { notesTokens } = tokens;
    const { UnlockScreen } = unlock;
    const { NotesShell } = shell;
    const { getStoredTheme, subscribeExplorerTheme } = theme;
    const { notesAppReducer, notesAppViewModel } = logic;

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
      inputs: t.record({}),
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

        const [appState, setAppState] = state({
          password: null,
          creating: false,
          error: "",
        });
        const [themeValue, setTheme] = state(getStoredTheme());
        const hostRef = ref();
        const vm = notesAppViewModel(appState);

        effect(() => subscribeExplorerTheme(setTheme), []);

        effect(() => {
          const host = hostRef.current;
          if (host?.setAttribute) host.setAttribute("data-theme", themeValue);
        }, [themeValue]);

        const unlockVault = (value, { create }) => {
          setAppState(
            notesAppReducer(appState, {
              type: "unlock",
              password: value,
              create: Boolean(create),
            }),
          );
        };

        const lock = () => {
          setAppState(notesAppReducer(appState, { type: "lock" }));
        };

        const unlockFailed = (message) => {
          setAppState(
            notesAppReducer(appState, {
              type: "unlockFailed",
              message: message || "Wrong password.",
            }),
          );
        };

        if (vm.locked) {
          return tpl`
            <dimui-unlock
              .props="${{
                title: "Notes",
                unlockHint:
                  "Enter your password to decrypt notes stored in this browser.",
                createHint:
                  "Choose a password to encrypt your notes. There is no recovery if you forget it.",
                vaultFlag: "dimui-vault",
                onUnlock: unlockVault,
                error: appState.error,
                theme: themeValue,
              }}"
            />
          `;
        }

        return tpl`
          <dimui-notes-shell
            .props="${{
              password: appState.password,
              create: appState.creating,
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
