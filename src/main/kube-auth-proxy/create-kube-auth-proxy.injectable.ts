/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubeAuthProxyDependencies } from "./kube-auth-proxy";
import { KubeAuthProxy } from "./kube-auth-proxy";
import type { Cluster } from "../../common/cluster/cluster";
import spawnInjectable from "../child-process/spawn.injectable";
import kubeAuthProxyCertificateInjectable from "./kube-auth-proxy-certificate.injectable";
import loggerInjectable from "../../common/logger.injectable";
import waitUntilPortIsUsedInjectable from "./wait-until-port-is-used/wait-until-port-is-used.injectable";
import lensK8sProxyPathInjectable from "./lens-k8s-proxy-path.injectable";

export type CreateKubeAuthProxy = (cluster: Cluster, environmentVariables: NodeJS.ProcessEnv) => KubeAuthProxy;

const createKubeAuthProxyInjectable = getInjectable({
  id: "create-kube-auth-proxy",

  instantiate: (di): CreateKubeAuthProxy => {
    const dependencies: Omit<KubeAuthProxyDependencies, "proxyCert"> = {
      proxyBinPath: di.inject(lensK8sProxyPathInjectable),
      spawn: di.inject(spawnInjectable),
      logger: di.inject(loggerInjectable),
      waitUntilPortIsUsed: di.inject(waitUntilPortIsUsedInjectable),
    };

    return (cluster: Cluster, environmentVariables: NodeJS.ProcessEnv) => {
      const clusterUrl = new URL(cluster.apiUrl);

      return new KubeAuthProxy({
        ...dependencies,
        proxyCert: di.inject(kubeAuthProxyCertificateInjectable, clusterUrl.hostname),
      }, cluster, environmentVariables);
    };
  },
});

export default createKubeAuthProxyInjectable;
