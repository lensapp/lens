// Setup default configuration for external npm-packages.
import * as Mobx from "mobx";
import * as Immer from "immer";

export default function configurePackages() {
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
  // Required in `utils/storage-helper.ts`
  Immer.setAutoFreeze(false); // allow to merge mobx observables
  Immer.enableMapSet(); // allow to merge maps and sets
}
