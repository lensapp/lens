/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RequestPromiseOptions } from "request-promise-native";
import request from "request-promise-native";
import { apiKubePrefix } from "../common/vars";
import type { Cluster } from "../common/cluster/cluster";
import { getInjectable } from "@ogre-tools/injectable";
import lensProxyPortInjectable from "./lens-proxy/lens-proxy-port.injectable";

export type K8sRequest = (cluster: Cluster, path: string, options?: RequestPromiseOptions) => Promise<any>;

const k8sRequestInjectable = getInjectable({
  id: "k8s-request",

  instantiate: (di) => {
    const lensProxyPort = di.inject(lensProxyPortInjectable);

    return async (
      cluster: Cluster,
      path: string,
      options: RequestPromiseOptions = {},
    ) => {
      const kubeProxyUrl = `http://localhost:${lensProxyPort.get()}${apiKubePrefix}`;

      options.headers ??= {};
      options.json ??= true;
      options.timeout ??= 30000;
      options.headers.Host = `${cluster.id}.${new URL(kubeProxyUrl).host}`; // required in ClusterManager.getClusterForRequest()

      return request(kubeProxyUrl + path, options);
    };
  },
});

export default k8sRequestInjectable;
