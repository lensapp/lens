/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type {
  ClusterOverviewStorageState } from "./cluster-overview-store";
import {
  ClusterOverviewStore,
  MetricNodeRole,
  MetricType,
} from "./cluster-overview-store";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager/manager.injectable";
import { clusterApi } from "../../../../common/k8s-api/endpoints";

const clusterOverviewStoreInjectable = getInjectable({
  id: "cluster-overview-store",

  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    const storage = createStorage<ClusterOverviewStorageState>(
      "cluster_overview",
      {
        metricType: MetricType.CPU, // setup defaults
        metricNodeRole: MetricNodeRole.WORKER,
      },
    );

    const store = new ClusterOverviewStore({
      storage,
    }, clusterApi);

    const apiManager = di.inject(apiManagerInjectable);

    apiManager.registerStore(store);

    return store;
  },
});

export default clusterOverviewStoreInjectable;
