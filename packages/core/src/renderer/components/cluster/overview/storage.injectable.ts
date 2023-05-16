/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

export type MetricType = "memory" | "cpu";
export type MetricNodeRole = "master" | "worker";

export interface ClusterOverviewStorageState {
  metricType: MetricType;
  metricNodeRole: MetricNodeRole;
}

const clusterOverviewStorageInjectable = getInjectable({
  id: "cluster-overview-storage",
  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    return createStorage<ClusterOverviewStorageState>(
      "cluster_overview",
      {
        metricType: "cpu", // setup defaults
        metricNodeRole: "worker",
      },
    );
  },
});

export default clusterOverviewStorageInjectable;
