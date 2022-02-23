/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { KubeAuthProxy } from "./kube-auth-proxy";
import type { Cluster } from "../../common/cluster/cluster";
import directoryForBinariesInjectable from "../../common/app-paths/directory-for-binaries/directory-for-binaries.injectable";
import path from "path";
import { isDevelopment, isWindows } from "../../common/vars";

const createKubeAuthProxyInjectable = getInjectable({
  instantiate: (di) => {
    const binaryName = isWindows ? "lens-k8s-proxy.exe" : "lens-k8s-proxy";
    const proxyPath = isDevelopment ? path.join("client", process.platform, process.arch) : process.arch;
    const dependencies = {
      proxyBinPath: path.join(di.inject(directoryForBinariesInjectable), proxyPath, binaryName),
    };

    return (cluster: Cluster, environmentVariables: NodeJS.ProcessEnv) =>
      new KubeAuthProxy(dependencies, cluster, environmentVariables);
  },

  lifecycle: lifecycleEnum.singleton,
});

export default createKubeAuthProxyInjectable;
