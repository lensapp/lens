/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import kubeconfigManagerInjectable from "../kubeconfig-manager/kubeconfig-manager.injectable";

export type RemoveProxyKubeconfig = () => Promise<void>;

const removeProxyKubeconfigInjectable = getInjectable({
  id: "remove-proxy-kubeconfig",
  instantiate: (di, cluster): RemoveProxyKubeconfig => {
    const proxyKubeconfigManager = di.inject(kubeconfigManagerInjectable, cluster);

    return () => proxyKubeconfigManager.clear();
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default removeProxyKubeconfigInjectable;
