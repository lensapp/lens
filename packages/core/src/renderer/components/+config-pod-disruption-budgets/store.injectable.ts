/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import podDisruptionBudgetApiInjectable from "../../../common/k8s-api/endpoints/pod-disruption-budget.api.injectable";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { PodDisruptionBudgetStore } from "./store";

const podDisruptionBudgetStoreInjectable = getInjectable({
  id: "pod-disruption-budget-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "podDisruptionBudgetStore is only available in certain environments");

    const api = di.inject(podDisruptionBudgetApiInjectable);

    return new PodDisruptionBudgetStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default podDisruptionBudgetStoreInjectable;
