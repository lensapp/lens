/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "../api-manager.injectable";
import type { PodMetricsApi } from "./pod-metrics.api";

const podMetricsApiInjectable = getInjectable({
  instantiate: (di) => di.inject(apiManagerInjectable).getApi("/apis/metrics.k8s.io/v1beta1/pods") as PodMetricsApi,
  lifecycle: lifecycleEnum.singleton,
});

export default podMetricsApiInjectable;
