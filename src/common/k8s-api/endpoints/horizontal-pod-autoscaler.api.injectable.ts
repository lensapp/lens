/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { HorizontalPodAutoscalerApi } from "./horizontal-pod-autoscaler.api";

const horizontalPodAutoscalerApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/autoscaling/v2beta1/horizontalpodautoscalers") as HorizontalPodAutoscalerApi,
  lifecycle: lifecycleEnum.singleton,
});

export default horizontalPodAutoscalerApiInjectable;
