/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import directoryForTempInjectable from "../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import type { KubeconfigManagerDependencies } from "./kubeconfig-manager";
import { KubeconfigManager } from "./kubeconfig-manager";
import lensProxyPortInjectable from "../lens-proxy/port.injectable";

export interface KubeConfigManagerInstantiationParameter {
  cluster: Cluster;
}

export type CreateKubeConfigManager = (cluster: Cluster) => KubeconfigManager | undefined;

const createKubeconfigManagerInjectable = getInjectable({
  id: "create-kubeconfig-manager",

  instantiate: (di): CreateKubeConfigManager => {
    const dependencies: KubeconfigManagerDependencies = {
      directoryForTemp: di.inject(directoryForTempInjectable),
      proxyPort: di.inject(lensProxyPortInjectable),
    };

    return (cluster) => new KubeconfigManager(dependencies, cluster);
  },
});

export default createKubeconfigManagerInjectable;
