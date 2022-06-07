/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import selfsigned from "selfsigned";
import type { Cluster } from "../../common/cluster/cluster";
import type { ClusterContextHandler } from "./context-handler";
import { ContextHandler } from "./context-handler";
import createKubeAuthProxyInjectable from "../kube-auth-proxy/create-kube-auth-proxy.injectable";
import { getKubeAuthProxyCertificate } from "../kube-auth-proxy/get-kube-auth-proxy-certificate";
import URLParse from "url-parse";
import prometheusProviderRegistryInjectable from "../prometheus/prometheus-provider-registry.injectable";

const createContextHandlerInjectable = getInjectable({
  id: "create-context-handler",

  instantiate: (di) => {
    const createKubeAuthProxy = di.inject(createKubeAuthProxyInjectable);
    const prometheusProviderRegistry = di.inject(prometheusProviderRegistryInjectable);

    return (cluster: Cluster): ClusterContextHandler => {
      const clusterUrl = new URLParse(cluster.apiUrl);

      const dependencies = {
        createKubeAuthProxy,
        prometheusProviderRegistry,
        authProxyCa: getKubeAuthProxyCertificate(clusterUrl.hostname, selfsigned.generate).cert,
      };

      return new ContextHandler(dependencies, cluster);
    };
  },
});

export default createContextHandlerInjectable;
