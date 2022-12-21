/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../common/logger.injectable";
import type { KubeApiResource } from "../../common/rbac";
import type { Cluster } from "../../common/cluster/cluster";
import { requestApiVersionsInjectionToken } from "./request-api-versions";
import { withConcurrencyLimit } from "../../common/utils/with-concurrency-limit";
import requestKubeApiResourcesForInjectable from "./request-kube-api-resources-for.injectable";

export type RequestApiResources = (cluster: Cluster) => Promise<KubeApiResource[]>;

export interface KubeResourceListGroup {
  group: string;
  path: string;
}

const requestApiResourcesInjectable = getInjectable({
  id: "request-api-resources",
  instantiate: (di): RequestApiResources => {
    const logger = di.inject(loggerInjectable);
    const apiVersionRequesters = di.injectMany(requestApiVersionsInjectionToken);
    const requestKubeApiResourcesFor = di.inject(requestKubeApiResourcesForInjectable);

    return async (cluster) => {
      const requestKubeApiResources = withConcurrencyLimit(5)(requestKubeApiResourcesFor(cluster));

      try {
        const requests = await Promise.all(apiVersionRequesters.map(fn => fn(cluster)));
        const resources = await Promise.all((
          requests
            .flat()
            .map(requestKubeApiResources)
        ));

        return resources.flat();
      } catch (error) {
        logger.error(`[LIST-API-RESOURCES]: failed to list api resources: ${error}`);

        return [];
      }
    };
  },
});

export default requestApiResourcesInjectable;
