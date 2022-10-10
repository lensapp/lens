/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubeAuthProxyDependencies } from "./kube-auth-proxy";
import { KubeAuthProxy } from "./kube-auth-proxy";
import type { Cluster } from "../../common/cluster/cluster";
import selfsigned from "selfsigned";
import { getBinaryName } from "../../common/vars";
import spawnInjectable from "../child-process/spawn.injectable";
import { getKubeAuthProxyCertificate } from "./get-kube-auth-proxy-certificate";
import loggerInjectable from "../../common/logger.injectable";
import baseBundledBinariesDirectoryInjectable from "../../common/vars/base-bundled-binaries-dir.injectable";
import waitUntilPortIsUsedInjectable from "./wait-until-port-is-used/wait-until-port-is-used.injectable";
import joinPathsInjectable from "../../common/path/join-paths.injectable";

export type CreateKubeAuthProxy = (cluster: Cluster, environmentVariables: NodeJS.ProcessEnv) => KubeAuthProxy;

const createKubeAuthProxyInjectable = getInjectable({
  id: "create-kube-auth-proxy",

  instantiate: (di): CreateKubeAuthProxy => {
    const binaryName = getBinaryName("lens-k8s-proxy");
    const joinPaths = di.inject(joinPathsInjectable);

    return (cluster: Cluster, environmentVariables: NodeJS.ProcessEnv) => {
      const clusterUrl = new URL(cluster.apiUrl);
      const dependencies: KubeAuthProxyDependencies = {
        proxyBinPath: joinPaths(di.inject(baseBundledBinariesDirectoryInjectable), binaryName),
        proxyCert: getKubeAuthProxyCertificate(clusterUrl.hostname, selfsigned.generate),
        spawn: di.inject(spawnInjectable),
        logger: di.inject(loggerInjectable),
        waitUntilPortIsUsed: di.inject(waitUntilPortIsUsedInjectable),
      };

      return new KubeAuthProxy(dependencies, cluster, environmentVariables);
    };
  },
});

export default createKubeAuthProxyInjectable;
