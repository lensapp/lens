/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { HorizontalPodAutoscalerApi } from "./horizontal-pod-autoscaler.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const horizontalPodAutoscalerApiInjectable = getInjectable({
  id: "horizontal-pod-autoscaler-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "horizontalPodAutoscalerApi is only available in certain environments");

    return new HorizontalPodAutoscalerApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default horizontalPodAutoscalerApiInjectable;
