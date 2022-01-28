/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { StorageLayer } from "../../utils";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";
import { ClusterOverviewStorageState, MetricNodeRole, MetricType } from "./overview.state";

let storage: StorageLayer<ClusterOverviewStorageState>;

const clusterOverviewStateInjectable = getInjectable({
  setup: async (di) => {
    storage = await di.inject(createStorageInjectable)<ClusterOverviewStorageState>("cluster_overview", {
      metricType: MetricType.CPU,
      metricNodeRole: MetricNodeRole.WORKER,
    });
  },
  instantiate: () => storage,
  lifecycle: lifecycleEnum.singleton,
});

export default clusterOverviewStateInjectable;
