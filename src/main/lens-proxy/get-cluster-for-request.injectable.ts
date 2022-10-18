/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IncomingMessage } from "http";
import getClusterByIdInjectable from "../../common/cluster-store/get-by-id.injectable";
import type { Cluster } from "../../common/cluster/cluster";
import { getClusterIdFromHost } from "../../common/utils";
import { apiKubePrefix } from "../../common/vars";

export type GetClusterForRequest = (req: IncomingMessage) => Cluster | undefined;

const getClusterForRequestInjectable = getInjectable({
  id: "get-cluster-for-request",
  instantiate: (di): GetClusterForRequest => {
    const getClusterById = di.inject(getClusterByIdInjectable);

    return (req) => {
      const { host } = req.headers;

      if (!host || !req.url) {
        return undefined;
      }

      // lens-server is connecting to 127.0.0.1:<port>/<uid>
      if (host.startsWith("127.0.0.1") || host.startsWith("localhost")) {
        {
          const clusterId = req.url.split("/")[1];
          const cluster = getClusterById(clusterId);

          if (cluster) {
            // we need to swap path prefix so that request is proxied to kube api
            req.url = req.url.replace(`/${clusterId}`, apiKubePrefix);

            return cluster;
          }
        }

        {
          const searchParams = new URLSearchParams(req.url);
          const clusterId = searchParams.get("clusterId");

          if (clusterId) {
            return getClusterById(clusterId);
          }
        }
      }

      const clusterId = getClusterIdFromHost(host);

      if (clusterId) {
        return getClusterById(clusterId);
      }

      return undefined;
    };
  },
});

export default getClusterForRequestInjectable;
