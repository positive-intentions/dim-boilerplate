/**
 * Pure notes-app reducer + view-model (verifiable subset).
 */
BP.module("notes/lib/notes-app-logic", [], function () {
  const { contract, t } = Dim;

  const AppState = t.record({
    password: t.nullable(t.string({ max: 200 })),
    creating: t.bool(),
    error: t.string({ max: 200 }),
  });

  const AppAction = t.union([
    t.record({
      type: t.lit("unlock"),
      password: t.string({ min: 1, max: 200 }),
      create: t.bool(),
    }),
    t.record({ type: t.lit("lock") }),
    t.record({
      type: t.lit("unlockFailed"),
      message: t.string({ max: 200 }),
    }),
  ]);

  const notesAppReducer = contract(
    {
      name: "notesAppReducer",
      kind: "reducer",
      args: [AppState, AppAction],
      returns: AppState,
      ensures: (next) =>
        next.password === null || typeof next.password === "string",
    },
    (state, action) => {
      if (action.type === "unlock") {
        return {
          password: action.password,
          creating: action.create,
          error: "",
        };
      }
      if (action.type === "lock") {
        return { password: null, creating: false, error: "" };
      }
      if (action.type === "unlockFailed") {
        return {
          password: null,
          creating: false,
          error: action.message,
        };
      }
      return state;
    },
  );

  const notesAppViewModel = contract(
    {
      name: "notesAppViewModel",
      kind: "viewModel",
      args: [AppState],
      returns: t.record({ locked: t.bool() }),
      ensures: (vm) => vm.locked === true || vm.locked === false,
    },
    (state) => ({ locked: state.password === null }),
  );

  return { notesAppReducer, notesAppViewModel, AppState, AppAction };
});
