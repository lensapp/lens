/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { KubeAuthProxy } from "./kube-auth-proxy";
import type { Cluster } from "../../common/cluster/cluster";
import path from "path";
import { isDevelopment, isWindows } from "../../common/vars";
import directoryForBundledBinariesInjectable from "../../common/app-paths/directory-for-bundled-binaries/directory-for-bundled-binaries.injectable";

const createKubeAuthProxyInjectable = getInjectable({
  id: "create-kube-auth-proxy",

  instantiate: (di) => {
    const binaryName = isWindows ? "lens-k8s-proxy.exe" : "lens-k8s-proxy";
    const proxyPath = isDevelopment ? path.join("client", process.platform, process.arch) : process.arch;
    const dependencies = {
      proxyBinPath: path.join(di.inject(directoryForBundledBinariesInjectable), proxyPath, binaryName),
    };

    return (cluster: Cluster, environmentVariables: NodeJS.ProcessEnv) =>
      new KubeAuthProxy(dependencies, cluster, environmentVariables);
  },
});

export default createKubeAuthProxyInjectable;
