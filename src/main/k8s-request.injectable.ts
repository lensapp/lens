/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiKubePrefix } from "../common/vars";
import type { Cluster } from "../common/cluster/cluster";
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestInit } from "node-fetch";
import lensFetchInjectable from "../common/fetch/lens-fetch.injectable";
import { withTimeout } from "../common/fetch/timeout-controller";

export interface K8sRequestInit extends Omit<RequestInit, "signal"> {
  timeout?: number;
}

export type K8sRequest = (cluster: Cluster, path: string, init?: K8sRequestInit) => Promise<unknown>;

const k8sRequestInjectable = getInjectable({
  id: "k8s-request",

  instantiate: (di): K8sRequest => {
    const lensFetch = di.inject(lensFetchInjectable);

    return async (cluster, path, { timeout = 30_000, ...init } = {}) => {
      const controller = withTimeout(timeout);

      return lensFetch(`/${cluster.id}${apiKubePrefix}${path}`, {
        ...init,
        signal: controller.signal,
      });
    };
  },
});

export default k8sRequestInjectable;
