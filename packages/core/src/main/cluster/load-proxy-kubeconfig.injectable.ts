/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncResult } from "@k8slens/utilities";
import type { KubeConfig } from "@kubernetes/client-node";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { ZodError } from "zod";
import type { Cluster } from "../../common/cluster/cluster";
import loadConfigFromFileInjectable from "../../common/kube-helpers/load-config-from-file.injectable";
import kubeconfigManagerInjectable from "../kubeconfig-manager/kubeconfig-manager.injectable";

export type LoadProxyKubeconfig = () => AsyncResult<KubeConfig, ZodError<unknown>>;

const loadProxyKubeconfigInjectable = getInjectable({
  id: "load-proxy-kubeconfig",
  instantiate: (di, cluster): LoadProxyKubeconfig => {
    const loadConfigFromFile = di.inject(loadConfigFromFileInjectable);
    const proxyKubeconfigManager = di.inject(kubeconfigManagerInjectable, cluster);

    return async () => {
      const proxyKubeconfigPath = await proxyKubeconfigManager.ensurePath();

      return loadConfigFromFile(proxyKubeconfigPath);
    };
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default loadProxyKubeconfigInjectable;
