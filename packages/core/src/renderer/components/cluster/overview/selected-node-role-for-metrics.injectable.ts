/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action, computed } from "mobx";
import nodeStoreInjectable from "../../nodes/store.injectable";
import type { MetricNodeRole } from "./storage.injectable";
import clusterOverviewStorageInjectable from "./storage.injectable";

export type SelectedNodeRoleForMetrics = ReturnType<typeof selectedNodeRoleForMetricsInjectable["instantiate"]>;

const selectedNodeRoleForMetricsInjectable = getInjectable({
  id: "selected-node-role-for-metrics",
  instantiate: (di) => {
    const storage = di.inject(clusterOverviewStorageInjectable);
    const nodeStore = di.inject(nodeStoreInjectable);

    const value = computed(() => {
      const { masterNodes, workerNodes } = nodeStore;
      const rawValue = storage.get().metricNodeRole;

      const hasMasterNodes = masterNodes.length > 0;
      const hasWorkerNodes = workerNodes.length > 0;

      if (hasMasterNodes && !hasWorkerNodes && rawValue === "worker") {
        return "master";
      }

      if (!hasMasterNodes && hasWorkerNodes && rawValue === "master") {
        return "worker";
      }

      return rawValue;
    });

    const nodes = computed(() => {
      const { masterNodes, workerNodes } = nodeStore;
      const role = value.get();

      if (role === "master") {
        return masterNodes.slice();
      }

      return workerNodes.slice();
    });

    const hasMasterNodes = computed(() => nodeStore.masterNodes.length > 0);
    const hasWorkerNodes = computed(() => nodeStore.workerNodes.length > 0);

    return {
      value,
      nodes,
      hasMasterNodes,
      hasWorkerNodes,
      set: action((value: MetricNodeRole) => {
        storage.merge({ metricNodeRole: value });
      }),
    };
  },
});

export default selectedNodeRoleForMetricsInjectable;
