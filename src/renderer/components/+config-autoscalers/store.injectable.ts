/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import horizontalPodAutoscalerApiInjectable from "../../../common/k8s-api/endpoints/horizontal-pod-autoscaler.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { HorizontalPodAutoscalerStore } from "./store";

const horizontalPodAutoscalerStoreInjectable = getInjectable({
  id: "horizontal-pod-autoscaler-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "horizontalPodAutoscalerStore is only available in certain environments");

    const api = di.inject(horizontalPodAutoscalerApiInjectable);

    return new HorizontalPodAutoscalerStore(api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default horizontalPodAutoscalerStoreInjectable;
