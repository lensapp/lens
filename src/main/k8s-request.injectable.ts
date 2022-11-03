/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiKubePrefix } from "../common/vars";
import type { Cluster } from "../common/cluster/cluster";
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestInit } from "node-fetch";
import lensFetchInjectable from "../common/fetch/lens-fetch.injectable";

export type K8sRequest = (cluster: Cluster, path: string, options?: RequestInit) => Promise<unknown>;

const k8sRequestInjectable = getInjectable({
  id: "k8s-request",

  instantiate: (di): K8sRequest => {
    const lensFetch = di.inject(lensFetchInjectable);

    return async (cluster, path, init) => lensFetch(`/${cluster.id}${apiKubePrefix}${path}`, init);
  },
});

export default k8sRequestInjectable;
