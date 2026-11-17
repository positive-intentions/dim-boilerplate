BP.module("notes/lib/tokens", [], function () {
  const { css } = Dim;

  /**
   * Theme CSS variables. Apply on themed roots only —
   * a bare :host light block would wipe inherited dark mode on nested hosts.
   */
  const notesTokens = css`
    :host {
      display: block;
      width: 100%;
      min-height: 100%;
      height: 100%;
      color: var(--notes-text);
      font-family: "Segoe UI", system-ui, sans-serif;
    }

    :host([data-theme="light"]),
    .notes-app[data-theme="light"],
    .frame[data-theme="light"],
    .notes-app:not([data-theme]),
    .frame:not([data-theme]) {
      --notes-bg: #f8fafc;
      --notes-surface: #ffffff;
      --notes-surface-2: #f1f5f9;
      --notes-surface-hover: #e2e8f0;
      --notes-border: #e2e8f0;
      --notes-text: #0f172a;
      --notes-text-muted: #475569;
      --notes-text-faint: #94a3b8;
      --notes-danger: #dc2626;
      --notes-primary: #0284d4;
      --notes-primary-soft: #e0f2fe;
    }

    :host([data-theme="dark"]),
    .notes-app[data-theme="dark"],
    .frame[data-theme="dark"] {
      --notes-bg: #0f172a;
      --notes-surface: #0b1220;
      --notes-surface-2: #1e293b;
      --notes-surface-hover: #334155;
      --notes-border: #334155;
      --notes-text: #e2e8f0;
      --notes-text-muted: #94a3b8;
      --notes-text-faint: #64748b;
      --notes-danger: #f87171;
      --notes-primary: #029cfd;
      --notes-primary-soft: #1a3a5c;
    }

    * {
      box-sizing: border-box;
    }
  `;

  return { notesTokens };
});
