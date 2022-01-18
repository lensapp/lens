/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Add id for clusters and store them to array
import { v4 as uuid } from "uuid";
import type { MigrationDeclaration } from "../helpers";

export default {
  version: "2.7.0-beta.1",
  run(store) {
    const clusters: any[] = [];

    for (const value of store) {
      const clusterKey = value[0];

      if (clusterKey === "__internal__") continue;
      if (clusterKey === "clusters") continue;
      const cluster = value[1];

      cluster.id = uuid();

      if (!cluster.preferences.clusterName) {
        cluster.preferences.clusterName = clusterKey;
      }
      clusters.push(cluster);
      store.delete(clusterKey);
    }

    if (clusters.length > 0) {
      store.set("clusters", clusters);
    }
  },
} as MigrationDeclaration;
