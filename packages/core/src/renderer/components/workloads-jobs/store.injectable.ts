/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import getPodsByOwnerIdInjectable from "../workloads-pods/get-pods-by-owner-id.injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { jobApiInjectable, storesAndApisCanBeCreatedInjectionToken } from "@k8slens/kube-api-specifics";
import { loggerInjectionToken } from "@k8slens/logger";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import { JobStore } from "./store";

const jobStoreInjectable = getInjectable({
  id: "job-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "jobStore is only available in certain environments");

    const api = di.inject(jobApiInjectable);

    return new JobStore({
      getPodsByOwnerId: di.inject(getPodsByOwnerIdInjectable),
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default jobStoreInjectable;
