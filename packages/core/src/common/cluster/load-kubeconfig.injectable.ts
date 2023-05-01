/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeConfig } from "@kubernetes/client-node";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Cluster } from "./cluster";
import loadConfigFromFileInjectable from "../kube-helpers/load-config-from-file.injectable";
import type { AsyncResult } from "@k8slens/utilities";
import type { ZodError } from "zod";

export type LoadKubeconfig = () => AsyncResult<KubeConfig, ZodError<unknown>>;

const loadKubeconfigInjectable = getInjectable({
  id: "load-kubeconfig",
  instantiate: (di, cluster) => {
    const loadConfigFromFile = di.inject(loadConfigFromFileInjectable);

    return () => loadConfigFromFile(cluster.kubeConfigPath.get());
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default loadKubeconfigInjectable;
