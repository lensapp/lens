/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { V1APIVersions } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import k8sRequestInjectable from "../k8s-request.injectable";
import { apiVersionsRequesterInjectionToken } from "./api-versions-requester";

const requestCoreApiVersionsInjectable = getInjectable({
  id: "request-core-api-versions",
  instantiate: (di) => {
    const k8sRequest = di.inject(k8sRequestInjectable);

    return {
      request: async (cluster) => {
        try {
          const { versions } = await k8sRequest(cluster, "/api") as V1APIVersions;

          return {
            callWasSuccessful: true,
            response: versions.map(version => ({
              group: "",
              path: `/api/${version}`,
            })),
          };
        } catch (error) {
          return {
            callWasSuccessful: false,
            error: error as Error,
          };
        }
      },
      orderNumber: 10,
    };
  },
  injectionToken: apiVersionsRequesterInjectionToken,
});

export default requestCoreApiVersionsInjectable;
