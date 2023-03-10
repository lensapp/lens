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
import getPortFromStreamInjectable from "../utils/get-port-from-stream.injectable";
import getDirnameOfPathInjectable from "../../common/path/get-dirname.injectable";
import broadcastConnectionUpdateInjectable from "../cluster/broadcast-connection-update.injectable";

export type CreateKubeAuthProxy = (cluster: Cluster, env: NodeJS.ProcessEnv) => KubeAuthProxy;

const createKubeAuthProxyInjectable = getInjectable({
  id: "create-kube-auth-proxy",

  instantiate: (di): CreateKubeAuthProxy => {
    const dependencies: Omit<KubeAuthProxyDependencies, "proxyCert" | "broadcastConnectionUpdate"> = {
      proxyBinPath: di.inject(lensK8sProxyPathInjectable),
      spawn: di.inject(spawnInjectable),
      logger: di.inject(loggerInjectable),
      waitUntilPortIsUsed: di.inject(waitUntilPortIsUsedInjectable),
      getPortFromStream: di.inject(getPortFromStreamInjectable),
      dirname: di.inject(getDirnameOfPathInjectable),
    };

    return (cluster, env) => {
      const clusterUrl = new URL(cluster.apiUrl.get());

      return new KubeAuthProxy({
        ...dependencies,
        proxyCert: di.inject(kubeAuthProxyCertificateInjectable, clusterUrl.hostname),
        broadcastConnectionUpdate: di.inject(broadcastConnectionUpdateInjectable, cluster),
      }, cluster, env);
    };
  },
});

export default createKubeAuthProxyInjectable;
