/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MigrationDeclaration } from "../helpers";

// Cleans up a store that had the state related data stored

export default {
  version: "2.4.1",
  run(store) {
    for (const value of store) {
      const contextName = value[0];

      if (contextName === "__internal__") continue;
      const cluster = value[1];

      store.set(contextName, { kubeConfig: cluster.kubeConfig, icon: cluster.icon || null, preferences: cluster.preferences || {}});
    }
  },
} as MigrationDeclaration;
