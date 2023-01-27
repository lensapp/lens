/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { Cluster } from "./cluster/cluster";
import { object } from "./utils";

function isDefinedEntry<T>(entry: readonly [T, string | undefined]): entry is [T, string] {
  return Boolean(entry[1]);
}

export interface ClusterEnvironment {
  HTTPS_PROXY?: string;
  NO_PROXY?: string;
}

const clusterEnvironmentInjectable = getInjectable({
  id: "cluster-environment",
  instantiate: (di, cluster) => computed(() => {
    const { preferences } = cluster;
    const entries = [
      ["HTTPS_PROXY", preferences.httpsProxy],
      ["NO_PROXY", preferences.noProxy],
    ] as const;

    return object.fromEntries(entries.filter(isDefinedEntry)) as ClusterEnvironment;
  }),
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default clusterEnvironmentInjectable;
