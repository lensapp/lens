/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import { getKubeStoreInjectable } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import networkPolicyApiInjectable from "../../../common/k8s-api/endpoints/network-policy.api.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { NetworkPolicyStore } from "./store";

const networkPolicyStoreInjectable = getKubeStoreInjectable({
  id: "network-policy-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "networkPolicyStore is only available in certain environments");

    const api = di.inject(networkPolicyApiInjectable);

    return new NetworkPolicyStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
});

export default networkPolicyStoreInjectable;
