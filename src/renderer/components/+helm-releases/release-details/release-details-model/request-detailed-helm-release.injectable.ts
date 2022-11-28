/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmReleaseDto } from "../../../../../common/k8s-api/endpoints/helm-releases.api";
import requestHelmReleasesInjectable from "../../../../../common/k8s-api/endpoints/helm-releases.api/request-releases.injectable";
import type { HelmReleaseDetails } from "../../../../../common/k8s-api/endpoints/helm-releases.api/request-details.injectable";
import requestHelmReleaseDetailsInjectable from "../../../../../common/k8s-api/endpoints/helm-releases.api/request-details.injectable";
import type { AsyncResult } from "../../../../../common/utils/async-result";

export interface DetailedHelmRelease {
  release: HelmReleaseDto;
  details?: HelmReleaseDetails;
}

export type RequestDetailedHelmRelease = (
  name: string,
  namespace: string
) => Promise<AsyncResult<DetailedHelmRelease>>;

const requestDetailedHelmReleaseInjectable = getInjectable({
  id: "request-detailed-helm-release",

  instantiate: (di): RequestDetailedHelmRelease => {
    const requestHelmReleases = di.inject(requestHelmReleasesInjectable);
    const requestHelmReleaseDetails = di.inject(requestHelmReleaseDetailsInjectable);

    return async (name, namespace) => {
      const [releases, details] = await Promise.all([
        requestHelmReleases(namespace),
        requestHelmReleaseDetails(name, namespace),
      ]);

      const release = releases.find(
        (rel) => rel.name === name && rel.namespace === namespace,
      );

      if (!release) {
        return {
          callWasSuccessful: false,
          error: `Release ${name} didn't exist in ${namespace} namespace.`,
        };
      }

      return { callWasSuccessful: true, response: { release, details }};
    };
  },
});

export default requestDetailedHelmReleaseInjectable;
