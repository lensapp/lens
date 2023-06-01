/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { PodMetricsApi } from "@k8slens/kube-api";

export const podMetricsApiInjectionToken = getInjectionToken<PodMetricsApi>({
  id: "pod-metrics-api-injection-token",
});
