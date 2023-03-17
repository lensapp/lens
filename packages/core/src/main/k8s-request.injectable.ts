/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensRequestInit } from "../common/fetch/lens-fetch.injectable";
import lensFetchInjectable from "../common/fetch/lens-fetch.injectable";
import { withTimeout } from "../common/fetch/timeout-controller";

export interface K8sRequestInit extends LensRequestInit {
  timeout?: number;
}

export interface ClusterData {
  readonly id: string;
}

export type K8sRequest = (cluster: ClusterData, pathnameAndQuery: string, init?: K8sRequestInit) => Promise<unknown>;

const k8sRequestInjectable = getInjectable({
  id: "k8s-request",

  instantiate: (di): K8sRequest => {
    const lensFetch = di.inject(lensFetchInjectable);

    return async (
      cluster,
      pathnameAndQuery,
      {
        timeout = 30_000,
        signal,
        ...init
      } = {},
    ) => {
      const controller = timeout ? withTimeout(timeout) : undefined;

      if (controller && signal) {
        signal.addEventListener("abort", () => controller.abort());
      }

      const response = await lensFetch(`/${cluster.id}${pathnameAndQuery}`, {
        ...init,
        signal: controller?.signal ?? signal,
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Failed to ${init.method ?? "get"} ${pathnameAndQuery} for clusterId=${cluster.id}: ${response.statusText}`, { cause: response });
      }

      return response.json();
    };
  },
});

export default k8sRequestInjectable;
