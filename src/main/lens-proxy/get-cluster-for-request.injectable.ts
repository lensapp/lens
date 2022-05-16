/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IncomingMessage } from "http";
import clusterStoreInjectable from "../../common/cluster-store/cluster-store.injectable";
import type { Cluster } from "../../common/cluster/cluster";
import { getClusterIdFromHost } from "../../common/utils";
import { apiKubePrefix } from "../../common/vars";

export type GetClusterForRequest = (req: IncomingMessage) => Cluster | undefined;

const getClusterForRequestInjectable = getInjectable({
  id: "get-cluster-for-request",
  instantiate: (di): GetClusterForRequest => {
    const store = di.inject(clusterStoreInjectable);

    return (req) => {
      if (!req.headers.host) {
        return undefined;
      }

      // lens-server is connecting to 127.0.0.1:<port>/<uid>
      if (req.url && req.headers.host.startsWith("127.0.0.1")) {
        const clusterId = req.url.split("/")[1];
        const cluster = store.getById(clusterId);

        if (cluster) {
          // we need to swap path prefix so that request is proxied to kube api
          req.url = req.url.replace(`/${clusterId}`, apiKubePrefix);
        }

        return cluster;
      }

      return store.getById(getClusterIdFromHost(req.headers.host));
    };
  },
});

export default getClusterForRequestInjectable;
