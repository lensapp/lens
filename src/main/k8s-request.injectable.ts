/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiKubePrefix } from "../common/vars";
import type { Cluster } from "../common/cluster/cluster";
import { getInjectable } from "@ogre-tools/injectable";
import lensProxyPortInjectable from "../features/lens-proxy/common/port.injectable";
import type { AuthenticatedRequestInit } from "../common/fetch/lens-authed-fetch.injectable";
import lensAuthenticatedFetchInjectable from "../common/fetch/lens-authed-fetch.injectable";
import nodeFetchModuleInjectable from "../common/fetch/fetch-module.injectable";
import { lensClusterIdHeader } from "../common/vars/auth-header";

export type K8sRequest = (cluster: Cluster, path: string, options?: AuthenticatedRequestInit) => Promise<unknown>;

const k8sRequestInjectable = getInjectable({
  id: "k8s-request",

  instantiate: (di): K8sRequest => {
    const lensProxyPort = di.inject(lensProxyPortInjectable);
    const fetch = di.inject(lensAuthenticatedFetchInjectable);
    const { Headers } = di.inject(nodeFetchModuleInjectable);

    return async (cluster, path, init = {}) => {
      const kubeProxyUrl = `https://localhost:${lensProxyPort.get()}${apiKubePrefix}`;
      const headers = new Headers(init.headers);

      headers.set(lensClusterIdHeader, cluster.id);

      const response = await fetch(kubeProxyUrl + path, {
        ...init,
        headers,
      });

      if (200 <= response.status && response.status < 300) {
        const body = await response.text();

        return JSON.parse(body);
      }

      throw new Error(`${(init.method ?? "GET").toUpperCase()} ${path} failed: ${response.statusText}`);
    };
  },
});

export default k8sRequestInjectable;
