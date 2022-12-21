/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IncomingMessage } from "http";
import getClusterByIdInjectable from "../../common/cluster-store/get-by-id.injectable";
import type { Cluster } from "../../common/cluster/cluster";
import { apiKubePrefix } from "../../common/vars";
import { lensClusterIdHeader } from "../../common/vars/auth-header";

export type GetClusterForRequest = (req: IncomingMessage) => Cluster | undefined;

const getClusterForRequestInjectable = getInjectable({
  id: "get-cluster-for-request",
  instantiate: (di): GetClusterForRequest => {
    const getClusterById = di.inject(getClusterByIdInjectable);

    return (req) => {
      const clusterId = req.headers[lensClusterIdHeader.toLowerCase()];

      console.log(clusterId);

      if (typeof clusterId === "string") {
        return getClusterById(clusterId);
      }

      // lens-server is connecting to 127.0.0.1:<port>/<uid>
      if (req.url && req.headers.host?.startsWith("127.0.0.1")) {
        const clusterId = req.url.split("/")[1];
        const cluster = getClusterById(clusterId);

        if (cluster) {
        // we need to swap path prefix so that request is proxied to kube api
          req.url = req.url.replace(`/${clusterId}`, apiKubePrefix);
        }

        return cluster;
      }

      return undefined;
    };
  },
});

export default getClusterForRequestInjectable;
