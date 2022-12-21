/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import leaseApiInjectable from "../../../common/k8s-api/endpoints/lease.api.injectable";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { LeaseStore } from "./store";

const leaseStoreInjectable = getInjectable({
  id: "lease-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "leaseStore is only available in certain environments");

    const api = di.inject(leaseApiInjectable);

    return new LeaseStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default leaseStoreInjectable;
