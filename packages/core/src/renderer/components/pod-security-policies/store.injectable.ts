/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import { getKubeStoreInjectable } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import podSecurityPolicyApiInjectable from "../../../common/k8s-api/endpoints/pod-security-policy.api.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import clusterFrameContextForClusterScopedResourcesInjectable from "../../cluster-frame-context/for-cluster-scoped-resources.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { PodSecurityPolicyStore } from "./store";

const podSecurityPolicyStoreInjectable = getKubeStoreInjectable({
  id: "pod-security-policy-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "podSecurityPolicyStore is only available in certain environments");

    const api = di.inject(podSecurityPolicyApiInjectable);

    return new PodSecurityPolicyStore({
      context: di.inject(clusterFrameContextForClusterScopedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
});

export default podSecurityPolicyStoreInjectable;
