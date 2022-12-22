/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { V1APIGroupList } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import { chain } from "../../common/utils/iter";
import k8sRequestInjectable from "../k8s-request.injectable";
import { requestApiVersionsInjectionToken } from "./request-api-versions";

const requestNonCoreApiVersionsInjectable = getInjectable({
  id: "request-non-core-api-versions",
  instantiate: (di) => {
    const k8sRequest = di.inject(k8sRequestInjectable);

    return async (cluster) => {
      const { groups } = await k8sRequest(cluster, "/apis") as V1APIGroupList;

      return chain(groups.values())
        .filterMap(group => group.preferredVersion?.groupVersion && ({
          group: group.name,
          path: `/apis/${group.preferredVersion.groupVersion}`,
        }))
        .collect(v => [...v]);
    };
  },
  injectionToken: requestApiVersionsInjectionToken,
});

export default requestNonCoreApiVersionsInjectable;
