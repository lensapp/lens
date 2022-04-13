/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { HorizontalPodAutoscalerApi } from "./horizontal-pod-autoscaler.api";

const horizontalPodAutoscalerApiInjectable = getInjectable({
  id: "horizontal-pod-autoscaler-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "horizontalPodAutoscalerApi is only available in certain environments");

    return new HorizontalPodAutoscalerApi();
  },
});

export default horizontalPodAutoscalerApiInjectable;
