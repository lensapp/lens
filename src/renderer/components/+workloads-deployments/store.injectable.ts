/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import { storesAndApisCanBeCreatedInjectionToken } from "../../../common/k8s-api/stores-apis-can-be-created.token";
import deploymentApiInjectable from "../../../common/k8s-api/endpoints/deployment.api.injectable";
import { DeploymentStore } from "./store";

const deploymentStoreInjectable = getInjectable({
  id: "deployment-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "deploymentStore is only available in certain environments");

    const api = di.inject(deploymentApiInjectable);

    return new DeploymentStore({
      podStore: di.inject(podStoreInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default deploymentStoreInjectable;
