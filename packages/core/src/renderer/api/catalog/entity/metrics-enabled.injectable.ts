/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { ClusterMetricsResourceType } from "../../../../common/cluster-types";
import activeEntityInternalClusterInjectable from "./get-active-cluster-entity.injectable";

const enabledMetricsInjectable = getInjectable({
  id: "enabled-metrics",
  instantiate: (di, kind) => {
    const activeEntityInternalCluster = di.inject(activeEntityInternalClusterInjectable);

    return computed(() => {
      const cluster = activeEntityInternalCluster.get();

      if (!cluster?.preferences.hiddenMetrics) {
        return true;
      }

      return !cluster.preferences.hiddenMetrics.includes(kind);
    });
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, kind: ClusterMetricsResourceType) => kind,
  }),
});

export default enabledMetricsInjectable;
