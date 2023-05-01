/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import { getKubeStoreInjectable } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import horizontalPodAutoscalerApiInjectable from "../../../common/k8s-api/endpoints/horizontal-pod-autoscaler.api.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { HorizontalPodAutoscalerStore } from "./store";

const horizontalPodAutoscalerStoreInjectable = getKubeStoreInjectable({
  id: "horizontal-pod-autoscaler-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "horizontalPodAutoscalerStore is only available in certain environments");

    const api = di.inject(horizontalPodAutoscalerApiInjectable);

    return new HorizontalPodAutoscalerStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
});

export default horizontalPodAutoscalerStoreInjectable;
