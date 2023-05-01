/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import podStoreInjectable from "../workloads-pods/store.injectable";
import { getKubeStoreInjectable } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { storesAndApisCanBeCreatedInjectionToken } from "../../../common/k8s-api/stores-apis-can-be-created.token";
import deploymentApiInjectable from "../../../common/k8s-api/endpoints/deployment.api.injectable";
import { DeploymentStore } from "./store";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

const deploymentStoreInjectable = getKubeStoreInjectable({
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
});

export default deploymentStoreInjectable;
