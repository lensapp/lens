/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RequestPromiseOptions } from "request-promise-native";
import request from "request-promise-native";
import type { Cluster } from "../common/cluster/cluster";
import { getInjectable } from "@ogre-tools/injectable";
import lensProxyPortInjectable from "./lens-proxy/lens-proxy-port.injectable";
import lensProxyCertificateInjectable from "./lens-proxy/lens-proxy-certificate.injectable";

export type K8sRequest = (cluster: Cluster, path: string, options?: RequestPromiseOptions) => Promise<any>;

const k8sRequestInjectable = getInjectable({
  id: "k8s-request",

  instantiate: (di) => {
    const lensProxyPort = di.inject(lensProxyPortInjectable);
    const lensProxyCertificate = di.inject(lensProxyCertificateInjectable);

    return async (
      cluster: Cluster,
      path: string,
      options: RequestPromiseOptions = {},
    ) => {
      const kubeProxyUrl = `https://127.0.0.1:${lensProxyPort.get()}/${cluster.id}`;

      options.ca = lensProxyCertificate.get().cert;
      options.headers ??= {};
      options.json ??= true;
      options.timeout ??= 30000;

      return request(kubeProxyUrl + path, options);
    };
  },
});

export default k8sRequestInjectable;
