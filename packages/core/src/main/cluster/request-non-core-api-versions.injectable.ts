/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { V1APIGroupList } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import { iter } from "@k8slens/utilities";
import k8sRequestInjectable from "../k8s-request.injectable";
import { apiVersionsRequesterInjectionToken } from "./api-versions-requester";

const requestNonCoreApiVersionsInjectable = getInjectable({
  id: "request-non-core-api-versions",
  instantiate: (di) => {
    const k8sRequest = di.inject(k8sRequestInjectable);

    return {
      request: async (cluster) => {
        try {
          const { groups } = (await k8sRequest(cluster, "/apis")) as V1APIGroupList;

          return {
            callWasSuccessful: true,
            response: iter.chain(groups.values())
              .flatMap((group) =>
                group.versions.map((version) => ({
                  group: group.name,
                  path: `/apis/${version.groupVersion}`,
                })),
              )
              .collect((v) => [...v]),
          };
        } catch (error) {
          return {
            callWasSuccessful: false,
            error: error as Error,
          };
        }
      },
      orderNumber: 20,
    };
  },
  injectionToken: apiVersionsRequesterInjectionToken,
});

export default requestNonCoreApiVersionsInjectable;
