/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import podStoreInjectable from "../workloads-pods/store.injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { storesAndApisCanBeCreatedInjectionToken, deploymentApiInjectable } from "@k8slens/kube-api-specifics";
import { DeploymentStore } from "./store";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

const deploymentStoreInjectable = getInjectable({
  id: "deployment-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "deploymentStore is only available in certain environments");

    const api = di.inject(deploymentApiInjectable);

    return new DeploymentStore({
      podStore: di.inject(podStoreInjectable),
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default deploymentStoreInjectable;
