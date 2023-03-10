/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "../../../common/cluster/cluster";

export function isCurrentContext(config: KubeConfig, cluster: Cluster) {
  return config.currentContext == cluster.contextName.get();
}
