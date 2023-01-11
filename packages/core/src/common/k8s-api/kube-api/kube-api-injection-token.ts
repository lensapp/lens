/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { KubeApi } from "../kube-api";

export const kubeApiInjectionToken = getInjectionToken<KubeApi<any, any>>({
  id: "kube-api-injection-token",
});
