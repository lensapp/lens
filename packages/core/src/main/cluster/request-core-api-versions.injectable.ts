/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { V1APIVersions } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import k8sRequestInjectable from "../k8s-request.injectable";
import { requestApiVersionsInjectionToken } from "./request-api-versions";

const requestCoreApiVersionsInjectable = getInjectable({
  id: "request-core-api-versions",
  instantiate: (di) => {
    const k8sRequest = di.inject(k8sRequestInjectable);

    return async (cluster) => {
      const { versions } = await k8sRequest(cluster, "/api") as V1APIVersions;

      return versions.map(version => ({
        group: version,
        path: `/api/${version}`,
      }));
    };
  },
  injectionToken: requestApiVersionsInjectionToken,
});

export default requestCoreApiVersionsInjectable;
