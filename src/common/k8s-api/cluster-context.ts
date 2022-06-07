/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../cluster/cluster";

export interface ClusterContext {
  cluster: Cluster;
  allNamespaces: string[]; // available / allowed namespaces from cluster.ts
  contextNamespaces: string[]; // selected by user (see: namespace-select.tsx)
  hasSelectedAll: boolean;
}
