/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getClusterByIdInjectable from "../../features/cluster/storage/common/get-by-id.injectable";
import type { Cluster } from "../../common/cluster/cluster";
import { getClusterIdFromHost } from "../../common/utils";
import { apiKubePrefix } from "../../common/vars";
import type { ProxyIncomingMessage } from "./messages";

export type GetClusterForRequest = (req: ProxyIncomingMessage) => Cluster | undefined;

const getClusterForRequestInjectable = getInjectable({
  id: "get-cluster-for-request",
  instantiate: (di): GetClusterForRequest => {
    const getClusterById = di.inject(getClusterByIdInjectable);

    return (req) => {
      if (!req.headers.host) {
        return undefined;
      }

      // lens-server is connecting to 127.0.0.1:<port>/<uid>
      if (req.headers.host.startsWith("127.0.0.1")) {
        const clusterId = req.url.split("/")[1];
        const cluster = getClusterById(clusterId);

        if (cluster) {
        // we need to swap path prefix so that request is proxied to kube api
          req.url = req.url.replace(`/${clusterId}`, apiKubePrefix);
        }

        return cluster;
      }

      const clusterId = getClusterIdFromHost(req.headers.host);

      if (!clusterId) {
        return undefined;
      }

      return getClusterById(clusterId);
    };
  },
});

export default getClusterForRequestInjectable;
