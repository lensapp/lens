/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { KubeAuthProxy } from "./kube-auth-proxy";
import type { Cluster } from "../../common/cluster/cluster";
import bundledKubectlInjectable from "../kubectl/bundled-kubectl.injectable";

const createKubeAuthProxyInjectable = getInjectable({
  id: "create-kube-auth-proxy",

  instantiate: (di) => {
    const bundledKubectl = di.inject(bundledKubectlInjectable);

    const dependencies = {
      getProxyBinPath: bundledKubectl.getPath,
    };

    return (cluster: Cluster, environmentVariables: NodeJS.ProcessEnv) =>
      new KubeAuthProxy(dependencies, cluster, environmentVariables);
  },
});

export default createKubeAuthProxyInjectable;
