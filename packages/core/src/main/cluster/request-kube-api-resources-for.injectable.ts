/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { V1APIResourceList } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import type { KubeApiResource } from "../../common/rbac";
import type { AsyncResult } from "../../common/utils/async-result";
import k8sRequestInjectable from "../k8s-request.injectable";
import type { KubeResourceListGroup } from "./request-api-versions";

export type RequestKubeApiResources = (grouping: KubeResourceListGroup) => Promise<AsyncResult<KubeApiResource[], Error>>;

export type RequestKubeApiResourcesFor = (cluster: Cluster) => RequestKubeApiResources;

const requestKubeApiResourcesForInjectable = getInjectable({
  id: "request-kube-api-resources-for",
  instantiate: (di): RequestKubeApiResourcesFor => {
    const k8sRequest = di.inject(k8sRequestInjectable);

    return (cluster) => async ({ group, path }) => {
      try {
        const { resources } = await k8sRequest(cluster, path) as V1APIResourceList;

        return {
          callWasSuccessful: true,
          response: resources.map(resource => ({
            apiName: resource.name,
            kind: resource.kind,
            group,
            namespaced: resource.namespaced,
          })),
        };
      } catch (error) {
        return {
          callWasSuccessful: false,
          error: error as Error,
        };
      }
    };
  },
});

export default requestKubeApiResourcesForInjectable;
