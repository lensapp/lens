/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { KubeApi } from "@k8slens/kube-api";

export const kubeApiInjectionToken = getInjectionToken<KubeApi>({
  id: "kube-api-injection-token",
});

export interface KubeApiInjectableParts<Api> {
  id: string;
  instantiate: (
    di: DiContainerForInjection,
  ) => Api extends KubeApi<infer Kube, infer Data> ? KubeApi<Kube, Data> & Api : never;
}

export const getKubeApiInjectable = <Api>(parts: KubeApiInjectableParts<Api>) =>
  getInjectable({
    id: parts.id,
    instantiate: (di) => parts.instantiate(di),
    injectionToken: kubeApiInjectionToken,
  });
