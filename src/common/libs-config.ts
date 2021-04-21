// Global configuration setup for external packages.
// Should be imported at the top of app's entry points.
import { configure } from "mobx";
import { enableMapSet, setAutoFreeze } from "immer";

// Mobx
// Docs: https://mobx.js.org/configuration.html
configure({
  isolateGlobalState: true,
  enforceActions: "never",
});

// Immer
setAutoFreeze(false); // allow to merge mobx observables, docs: https://immerjs.github.io/immer/freezing
enableMapSet(); // allow to merge maps and sets, docs: https://immerjs.github.io/immer/map-set
