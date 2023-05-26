/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { KubeApi } from "@k8slens/kube-api";

export const kubeApiInjectionToken = getInjectionToken<KubeApi<any, any>>({
  id: "kube-api-injection-token",
});
