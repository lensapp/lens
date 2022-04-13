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
import clusterApiInjectable from "../../../../common/k8s-api/endpoints/cluster.api.injectable";
import createStoresAndApisInjectable from "../../../create-stores-apis.injectable";
import assert from "assert";
import nodeStoreInjectable from "../../+nodes/store.injectable";

const clusterOverviewStoreInjectable = getInjectable({
  id: "cluster-overview-store",

  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "clusterOverviewStore is only available in certain environments");
    const createStorage = di.inject(createStorageInjectable);
    const clusterApi = di.inject(clusterApiInjectable);
    const apiManager = di.inject(apiManagerInjectable);

    const storage = createStorage<ClusterOverviewStorageState>(
      "cluster_overview",
      {
        metricType: MetricType.CPU, // setup defaults
        metricNodeRole: MetricNodeRole.WORKER,
      },
    );
    const store = new ClusterOverviewStore({
      storage,
      nodeStore: di.inject(nodeStoreInjectable),
    }, clusterApi);

    apiManager.registerStore(store);

    return store;
  },
});

export default clusterOverviewStoreInjectable;
