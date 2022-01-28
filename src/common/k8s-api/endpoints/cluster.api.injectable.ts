/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { ClusterApi } from "./cluster.api";

const clusterApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/cluster.k8s.io/v1alpha1/clusters") as ClusterApi,
  lifecycle: lifecycleEnum.singleton,
});

export default clusterApiInjectable;
