/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import type { ClusterStore } from "./store";

const clusterStoreInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getStore("/apis/cluster.k8s.io/v1alpha1/clusters") as ClusterStore,
  lifecycle: lifecycleEnum.singleton,
});

export default clusterStoreInjectable;
