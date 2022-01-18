/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Add existing clusters to "default" workspace
import type { MigrationDeclaration } from "../helpers";

export default {
  version: "2.7.0-beta.0",
  run(store) {
    for (const value of store) {
      const clusterKey = value[0];

      if (clusterKey === "__internal__") continue;
      const cluster = value[1];

      cluster.workspace = "default";
      store.set(clusterKey, cluster);
    }
  },
} as MigrationDeclaration;
