/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MigrationDeclaration } from "../helpers";

/**
 * Early store format had the kubeconfig directly under context name, this moves
 * it under the kubeConfig key
 */

export default {
  version: "2.0.0-beta.2",
  run(store) {
    for (const value of store) {
      const contextName = value[0];

      // Looping all the keys gives out the store internal stuff too...
      if (contextName === "__internal__" || Object.prototype.hasOwnProperty.call(value[1], "kubeConfig")) continue;
      store.set(contextName, { kubeConfig: value[1] });
    }
  },
} as MigrationDeclaration;
