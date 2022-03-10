/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { KubeAuthProxy, KubeAuthProxyDependencies } from "./kube-auth-proxy";
import { spawn } from "child_process";
import type { Cluster } from "../../common/cluster/cluster";
import path from "path";
import { getBinaryName } from "../../common/vars";
import directoryForBundledBinariesInjectable from "../../common/app-paths/directory-for-bundled-binaries/directory-for-bundled-binaries.injectable";
import getKubeAuthProxyCertDirInjectable from "./kube-auth-proxy-cert.injectable";

const createKubeAuthProxyInjectable = getInjectable({
  id: "create-kube-auth-proxy",

  instantiate: (di) => {
    const binaryName = getBinaryName("lens-k8s-proxy");
    const dependencies: KubeAuthProxyDependencies = {
      proxyBinPath: path.join(di.inject(directoryForBundledBinariesInjectable), binaryName),
      proxyCertPath: di.inject(getKubeAuthProxyCertDirInjectable),
      spawn,
    };

    return (cluster: Cluster, environmentVariables: NodeJS.ProcessEnv) => (
      new KubeAuthProxy(dependencies, cluster, environmentVariables)
    );
  },
});

export default createKubeAuthProxyInjectable;
