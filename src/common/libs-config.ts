// Global configuration setup for external packages.
// Should be imported at the top of app's entry points.
import { configure } from "mobx";
import { enableMapSet, setAutoFreeze } from "immer";

// Mobx
configure({
  enforceActions: "never", // allows to skip using @action when class-method updates some state
});

// Immer
setAutoFreeze(false); // allow to merge observables
enableMapSet(); // allow merging maps and sets
