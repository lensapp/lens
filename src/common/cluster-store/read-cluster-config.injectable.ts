/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterConfigData, ClusterModel } from "../cluster-types";
import readFileSyncInjectable from "../fs/read-file-sync.injectable";
import { loadConfigFromString, validateKubeConfig } from "../kube-helpers";

export type ReadClusterConfigSync = (model: ClusterModel) => ClusterConfigData;

const readClusterConfigSyncInjectable = getInjectable({
  id: "read-cluster-config-sync",
  instantiate: (di): ReadClusterConfigSync => {
    const readFileSync = di.inject(readFileSyncInjectable);

    return ({ kubeConfigPath, contextName }) => {
      const kubeConfigData = readFileSync(kubeConfigPath);
      const { config } = loadConfigFromString(kubeConfigData);
      const result = validateKubeConfig(config, contextName);

      if (result.error) {
        throw result.error;
      }

      return { clusterServerUrl: result.cluster.server };
    };
  },
});

export default readClusterConfigSyncInjectable;
