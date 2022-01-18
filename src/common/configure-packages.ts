/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as Mobx from "mobx";
import * as Immer from "immer";

/**
 * Setup default configuration for external npm-packages
 */
export default function configurePackages() {
  // Docs: https://mobx.js.org/configuration.html
  Mobx.configure({
    enforceActions: "never",

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
