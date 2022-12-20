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

    return async (cluster) => {
      const apiLimit = plimit(5);
      const kubeApiResources: KubeApiResource[] = [];
      const resourceListGroups: KubeResourceListGroup[] = [];

      try {
        await Promise.all([
          (async () => {
            const { versions } = await k8sRequest(cluster, "/api") as V1APIVersions;

            for (const version of versions) {
              resourceListGroups.push({
                group: version,
                path: `/api/${version}`,
              });
            }
          })(),
          (async () => {
            const { groups } = await k8sRequest(cluster, "/apis") as V1APIGroupList;

            for (const { preferredVersion, name } of groups) {
              const { groupVersion } = preferredVersion ?? {};

              if (groupVersion) {
                resourceListGroups.push({
                  group: name,
                  path: `/apis/${groupVersion}`,
                });
              }
            }
          })(),
        ]);

        await Promise.all(
          resourceListGroups.map(({ group, path }) => apiLimit(async () => {
            const { resources } = await k8sRequest(cluster, path) as V1APIResourceList;

            for (const resource of resources) {
              kubeApiResources.push({
                apiName: resource.name,
                kind: resource.kind,
                group,
                namespaced: resource.namespaced,
              });
            }
          })),
        );
      } catch (error) {
        logger.error(`[LIST-API-RESOURCES]: failed to list api resources: ${error}`);
      }

      return kubeApiResources;
    };
  },
});

export default requestApiResourcesInjectable;
