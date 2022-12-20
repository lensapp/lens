/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { V1APIGroupList, V1APIResourceList, V1APIVersions } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import k8SRequestInjectable from "../../main/k8s-request.injectable";
import loggerInjectable from "../logger.injectable";
import type { KubeApiResource } from "../rbac";
import type { Cluster } from "./cluster";
import plimit from "p-limit";
import { pipeline } from "../utils/iter";

export type RequestApiResources = (cluster: Cluster) => Promise<KubeApiResource[]>;

interface KubeResourceListGroup {
  group: string;
  path: string;
}

const requestApiResourcesInjectable = getInjectable({
  id: "request-api-resources",
  instantiate: (di): RequestApiResources => {
    const k8sRequest = di.inject(k8SRequestInjectable);
    const logger = di.inject(loggerInjectable);

    const requestApiVersions = async (cluster: Cluster) => (await k8sRequest(cluster, "/api") as V1APIVersions).versions;
    const requestApisVersions = async (cluster: Cluster) => (await k8sRequest(cluster, "/apis") as V1APIGroupList).groups;
    const limitingFor = (limit: plimit.Limit) => <Args extends any[], Res>(fn: (...args: Args) => Res) => (...args: Args) => limit(() => fn(...args));
    const requestKubeApiResourcesFor = (cluster: Cluster) => async ({ group, path }: KubeResourceListGroup): Promise<KubeApiResource[]> => {
      const { resources } = await k8sRequest(cluster, path) as V1APIResourceList;

      return resources.map(resource => ({
        apiName: resource.name,
        kind: resource.kind,
        group,
        namespaced: resource.namespaced,
      }));
    };

    return async (cluster) => {
      const requestKubeApiResources = requestKubeApiResourcesFor(cluster);
      const withApiLimit = limitingFor(plimit(5));

      try {
        const resourceListGroups: KubeResourceListGroup[] = [
          ...(await requestApiVersions(cluster))
            .map(version => ({
              group: version,
              path: `/api/${version}`,
            })),
          ...pipeline((await requestApisVersions(cluster)).values())
            .filterMap(group => group.preferredVersion?.groupVersion && ({
              group: group.name,
              path: `/apis/${group.preferredVersion.groupVersion}`,
            })),
        ];

        const resources = await Promise.all(
          resourceListGroups
            .map(withApiLimit(requestKubeApiResources)),
        );

        return resources.flat();
      } catch (error) {
        logger.error(`[LIST-API-RESOURCES]: failed to list api resources: ${error}`);

        return [];
      }
    };
  },
});

export default requestApiResourcesInjectable;
