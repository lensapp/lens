/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import directoryForTempInjectable from "../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import type { KubeconfigManagerDependencies } from "./kubeconfig-manager";
import { KubeconfigManager } from "./kubeconfig-manager";
import loggerInjectable from "../../common/logger.injectable";

export interface KubeConfigManagerInstantiationParameter {
  cluster: Cluster;
}

export type CreateKubeconfigManager = (cluster: Cluster) => KubeconfigManager | undefined;

const createKubeconfigManagerInjectable = getInjectable({
  id: "create-kubeconfig-manager",

  instantiate: (di): CreateKubeconfigManager => {
    const dependencies: KubeconfigManagerDependencies = {
      directoryForTemp: di.inject(directoryForTempInjectable),
      logger: di.inject(loggerInjectable),
    };

    return (cluster) => new KubeconfigManager(dependencies, cluster);
  },
});

export default createKubeconfigManagerInjectable;
