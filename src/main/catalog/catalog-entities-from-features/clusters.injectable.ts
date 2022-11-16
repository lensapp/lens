/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { computed } from "mobx";

export interface ClusterDto {
  id: string;
  name: string;
  source: string;
  labels: Record<string, string>;
  distribution: string;

  kubeconfigPath: string;
  contextName: string;
  clusterServerUrl: string;
  version: string;
}

export const clusterInjectionToken = getInjectionToken<ClusterDto>({
  id: "cluster-injection-token",
});

const clustersInjectable = getInjectable({
  id: "clusters",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const clusters = computedInjectMany(clusterInjectionToken);

    return computed(() => clusters.get());
  },
});

export default clustersInjectable;
