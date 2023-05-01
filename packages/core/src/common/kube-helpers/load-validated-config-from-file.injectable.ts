/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncResult } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import type { ZodError } from "zod";
import type { Cluster } from "../cluster/cluster";
import readFileInjectable from "../fs/read-file.injectable";
import type { PartialKubeConfig } from "../kube-helpers";
import { loadValidatedConfig } from "../kube-helpers";
import resolveTildeInjectable from "../path/resolve-tilde.injectable";

export type LoadValidatedClusterConfig = (cluster: Cluster) => AsyncResult<PartialKubeConfig, string | ZodError<unknown>>;

const loadValidatedClusterConfigInjectable = getInjectable({
  id: "load-validated-cluster-config",
  instantiate: (di): LoadValidatedClusterConfig => {
    const readFile = di.inject(readFileInjectable);
    const resolveTilde = di.inject(resolveTildeInjectable);

    return async (cluster) => {
      const data = await readFile(resolveTilde(cluster.kubeConfigPath.get()));

      return loadValidatedConfig(data, cluster.contextName.get());
    };
  },
});

export default loadValidatedClusterConfigInjectable;
