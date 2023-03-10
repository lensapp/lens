/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import type { Cluster } from "../../../common/cluster/cluster";

export type IsInLocalKubeconfig = (cluster: Cluster) => boolean;

const isInLocalKubeconfigInjectable = getInjectable({
  id: "is-in-local-kubeconfig",
  instantiate: (di): IsInLocalKubeconfig => {
    const directoryForKubeConfigs = di.inject(directoryForKubeConfigsInjectable);

    return cluster => cluster.kubeConfigPath.get().startsWith(directoryForKubeConfigs);
  },
});

export default isInLocalKubeconfigInjectable;
