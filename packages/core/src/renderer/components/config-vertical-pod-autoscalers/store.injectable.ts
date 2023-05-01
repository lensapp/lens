/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import { loggerInjectionToken } from "@k8slens/logger";
import { getKubeStoreInjectable } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import verticalPodAutoscalerApiInjectable from "../../../common/k8s-api/endpoints/vertical-pod-autoscaler.api.injectable";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { VerticalPodAutoscalerStore } from "./store";

const verticalPodAutoscalerStoreInjectable = getKubeStoreInjectable({
  id: "vertical-pod-autoscaler-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "verticalPodAutoscalerStore is only available in certain environments");

    const api = di.inject(verticalPodAutoscalerApiInjectable);

    return new VerticalPodAutoscalerStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
});

export default verticalPodAutoscalerStoreInjectable;
