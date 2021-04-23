// Global configuration setup for external packages.
// Should be imported at the top of app's entry points.
import * as Mobx from "mobx";
import * as Immer from "immer";

// Docs: https://mobx.js.org/configuration.html
Mobx.configure({
  enforceActions: "never",
  isolateGlobalState: true,

  // TODO: enable later (read more: https://mobx.js.org/migrating-from-4-or-5.html)
  // computedRequiresReaction: true,
  // reactionRequiresObservable: true,
  // observableRequiresReaction: true,
});

// Docs: https://immerjs.github.io/immer/
Immer.setAutoFreeze(false); // allow to merge mobx observables
Immer.enableMapSet(); // allow to merge maps and sets
