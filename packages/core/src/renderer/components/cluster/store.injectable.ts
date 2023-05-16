/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import { ClusterStore } from "./store";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import clusterApiInjectable from "../../../common/k8s-api/endpoints/cluster.api.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import assert from "assert";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

const clusterStoreInjectable = getInjectable({
  id: "cluster-store",

  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "clusterStore is only available in certain environments");
    const clusterApi = di.inject(clusterApiInjectable);

    return new ClusterStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, clusterApi);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default clusterStoreInjectable;
