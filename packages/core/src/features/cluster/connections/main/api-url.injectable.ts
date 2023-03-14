/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { URL } from "url";
import type { Cluster } from "../../../../common/cluster/cluster";
import statInjectable from "../../../../common/fs/stat.injectable";
import loadValidatedClusterConfigInjectable from "../../../../common/kube-helpers/load-validated-config-from-file.injectable";

interface ClusterApiUrlState {
  url: URL;
  lastReadMtimeMs: number;
}

const clusterApiUrlInjectable = getInjectable({
  id: "cluster-api-url",
  instantiate: (di, cluster): () => Promise<URL> => {
    const loadValidatedClusterConfig = di.inject(loadValidatedClusterConfigInjectable);
    const stat = di.inject(statInjectable);

    let state: ClusterApiUrlState | undefined;

    return async () => {
      const stats = await stat(cluster.kubeConfigPath.get());

      if (!state || state.lastReadMtimeMs >= stats.mtimeMs) {
        const result = await loadValidatedClusterConfig(cluster);

        if (result.error) {
          throw result.error;
        }

        state = {
          url: new URL(result.cluster.server),
          lastReadMtimeMs: stats.mtimeMs,
        };
      }

      return state.url;
    };
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default clusterApiUrlInjectable;
