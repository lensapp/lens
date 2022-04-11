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

const createContextHandlerInjectable = getInjectable({
  id: "create-context-handler",

  instantiate: (di) => {
    const createKubeAuthProxy = di.inject(createKubeAuthProxyInjectable);

    return (cluster: Cluster): ClusterContextHandler | undefined => {
      const clusterUrl = new URLParse(cluster.apiUrl);

      return new ContextHandler(
        {
          createKubeAuthProxy,
          authProxyCa: getKubeAuthProxyCertificate(clusterUrl.hostname, selfsigned.generate).cert,
        },
        cluster,
      );
    };
  },
});

export default createContextHandlerInjectable;
