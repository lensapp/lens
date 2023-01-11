/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { ClusterMetricsResourceType } from "../../../../common/cluster-types";
import getActiveClusterEntityInjectable from "./get-active-cluster-entity.injectable";

const enabledMetricsInjectable = getInjectable({
  id: "enabled-metrics",
  instantiate: (di, kind) => {
    const getActiveClusterEntity = di.inject(getActiveClusterEntityInjectable);

    return computed(() => !getActiveClusterEntity()?.isMetricHidden(kind));
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, kind: ClusterMetricsResourceType) => kind,
  }),
});

export default enabledMetricsInjectable;
