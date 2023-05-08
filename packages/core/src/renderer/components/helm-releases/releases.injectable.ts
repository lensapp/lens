/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import releaseSecretsInjectable from "./release-secrets.injectable";
import requestListHelmReleasesInjectable from "../../../features/helm-releases/renderer/request-list-helm-releases.injectable";
import hostedClusterIdInjectable from "../../cluster-frame-context/hosted-cluster-id.injectable";
import assert from "assert";
import { iter } from "@k8slens/utilities";
import { prefixedLoggerInjectable } from "@k8slens/logger";
import { toHelmRelease } from "./to-helm-release";

const releasesInjectable = getInjectable({
  id: "releases",

  instantiate: (di) => {
    const clusterContext = di.inject(clusterFrameContextForNamespacedResourcesInjectable);
    const hostedClusterId = di.inject(hostedClusterIdInjectable);
    const releaseSecrets = di.inject(releaseSecretsInjectable);
    const requestListHelmReleases = di.inject(requestListHelmReleasesInjectable);
    const logger = di.inject(prefixedLoggerInjectable, "HELM-RELEASES");

    assert(hostedClusterId, "hostedClusterId is required");

    return asyncComputed({
      getValueFromObservedPromise: async () => {
        void releaseSecrets.get();

        const releaseResults = await (
          clusterContext.hasSelectedAll
            ? requestListHelmReleases({ clusterId: hostedClusterId })
            : Promise.all(clusterContext.contextNamespaces.map((namespace) => requestListHelmReleases({ clusterId: hostedClusterId, namespace })))
        );

        return iter.chain([releaseResults].flat().values())
          .filterMap((result) => {
            if (result.callWasSuccessful) {
              return result.response;
            }

            logger.warn("Failed to list helm releases", { error: result.error });

            return undefined;
          })
          .flatMap((releases) => releases)
          .map(toHelmRelease)
          .toArray();
      },
      valueWhenPending: [],
    });
  },
});


export default releasesInjectable;
