// Setup default configuration for external npm-packages.
import * as Mobx from "mobx";
import * as Immer from "immer";

const { isObservable, toJS, observable } = Mobx;

/**
 * Patch-fixing mobx@6.toJS() to support partially observable objects as data-input.
 * Otherwise it won't be recursively converted to corresponding non-observable plain JS-structure.
 * @example
 *  data = {one: 1, two: observable.array([2])}; // "data" itself is non-observable
 */
Object.defineProperty(Mobx, "toJS", {
  value(data: any) {
    if (typeof data === "object" && !isObservable(data)) {
      return toJS(observable.box(data).get());
    }

    return toJS(data);
  }
});

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
  // Required for `storage-helper.ts`
  Immer.setAutoFreeze(false); // allow to merge mobx observables
  Immer.enableMapSet(); // allow to merge maps and sets
}
