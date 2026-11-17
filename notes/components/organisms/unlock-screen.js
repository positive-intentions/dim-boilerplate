BP.module(
  "notes/components/organisms/unlock-screen",
  [
    "notes/components/atoms/button",
    "notes/components/atoms/text-field",
    "notes/lib/tokens",
    "notes/lib/vault",
  ],
  function (button, textField, tokens, vault) {
    const { define, css } = Dim;
    const { Button } = button;
    const { TextField } = textField;
    const { notesTokens } = tokens;
    const { VAULT_FLAG } = vault;

    const styles = css`
      ${notesTokens}

      .frame {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--notes-bg);
        color: var(--notes-text);
      }

      .unlock {
        flex: 1;
        display: grid;
        place-items: center;
        padding: 2rem 1.25rem;
      }

      .unlock-panel {
        width: min(360px, 100%);
      }

      .unlock-panel h1 {
        margin: 0 0 0.35rem;
        font-size: 1.75rem;
        font-weight: 650;
        letter-spacing: -0.02em;
        color: var(--notes-text);
      }

      .unlock-panel p {
        margin: 0 0 1.5rem;
        color: var(--notes-text-muted);
        line-height: 1.45;
      }

      .field-gap {
        margin: 0 0 1rem;
      }

      .error {
        margin: 0 0 1rem;
        color: var(--notes-danger);
        font-size: 0.9rem;
      }
    `;

    const UnlockScreen = define({
      tag: "dimui-unlock",
      component: (
        props,
        { html: tpl, useState: state, useStyle: style, useScope: scope },
      ) => {
        style(styles);
        scope({ Button, TextField });

        const hasVault =
          typeof props.hasVault === "boolean"
            ? props.hasVault
            : typeof localStorage !== "undefined" &&
              localStorage.getItem(VAULT_FLAG) === "1";

        const [password, setPassword] = state("");
        const [confirm, setConfirm] = state("");
        const [error, setError] = state("");
        const displayError = error || props.error || "";

        const onUnlock =
          typeof props.onUnlock === "function" ? props.onUnlock : () => {};

        const submit = () => {
          setError("");
          if (!password) {
            setError("Enter a password.");
            return;
          }
          if (!hasVault) {
            if (password.length < 4) {
              setError("Use at least 4 characters.");
              return;
            }
            if (password !== confirm) {
              setError("Passwords do not match.");
              return;
            }
            onUnlock(password, { create: true });
            return;
          }
          onUnlock(password, { create: false });
        };

        const onKeydown = (e) => {
          if (e.key === "Enter") submit();
        };

        const theme = props.theme === "light" ? "light" : "dark";

        return tpl`
          <div class="frame" data-theme="${theme}">
            <div class="unlock">
              <div class="unlock-panel">
                <h1>Notes</h1>
                <p>
                  ${hasVault
                    ? "Enter your password to decrypt notes stored in this browser."
                    : "Choose a password to encrypt your notes. There is no recovery if you forget it."}
                </p>

                <div class="field-gap">
                  <dimui-text-field
                    .props="${{
                      id: "password",
                      label: hasVault ? "Password" : "Create password",
                      type: "password",
                      autocomplete: hasVault
                        ? "current-password"
                        : "new-password",
                      value: password,
                      onInput: setPassword,
                      onKeydown,
                    }}"
                  />
                </div>

                ${!hasVault
                  ? tpl`
                      <div class="field-gap">
                        <dimui-text-field
                          .props="${{
                            id: "confirm",
                            label: "Confirm password",
                            type: "password",
                            autocomplete: "new-password",
                            value: confirm,
                            onInput: setConfirm,
                            onKeydown,
                          }}"
                        />
                      </div>
                    `
                  : null}

                ${displayError
                  ? tpl`<p class="error">${displayError}</p>`
                  : null}

                <dimui-button
                  .props="${{
                    label: hasVault ? "Unlock" : "Create vault",
                    onClick: submit,
                  }}"
                />
              </div>
            </div>
          </div>
        `;
      },
    });
    return { UnlockScreen };
  },
);
