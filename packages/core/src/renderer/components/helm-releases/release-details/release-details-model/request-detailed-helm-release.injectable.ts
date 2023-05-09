/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AsyncResult } from "@k8slens/utilities";
import { result } from "@k8slens/utilities";
import requestHelmReleaseInjectable from "../../../../../features/helm-releases/renderer/request–helm-release.injectable";
import type { GetHelmReleaseArgs, HelmReleaseDataWithResources } from "../../../../../features/helm-releases/common/channels";
import requestListHelmReleasesInjectable from "../../../../../features/helm-releases/renderer/request-list-helm-releases.injectable";
import type { HelmRelease } from "../../../../../common/k8s-api/endpoints/helm-releases.api";
import { toHelmRelease } from "../../to-helm-release";

export interface DetailedHelmRelease {
  release: HelmRelease;
  details: HelmReleaseDataWithResources;
}

export type RequestDetailedHelmRelease = (args: GetHelmReleaseArgs) => AsyncResult<DetailedHelmRelease, string>;

const requestDetailedHelmReleaseInjectable = getInjectable({
  id: "request-detailed-helm-release",

  instantiate: (di): RequestDetailedHelmRelease => {
    const requestListHelmReleases = di.inject(requestListHelmReleasesInjectable);
    const requestHelmRelease = di.inject(requestHelmReleaseInjectable);

    return async ({ clusterId, namespace, releaseName }) => {
      const listReleasesResult = await requestListHelmReleases({ clusterId, namespace });

      if (!listReleasesResult.isOk) {
        return listReleasesResult;
      }

      const detailsResult = await requestHelmRelease({ clusterId, releaseName, namespace });

      if (!detailsResult.isOk) {
        return detailsResult;
      }

      const release = listReleasesResult.value
        .find((rel) => rel.name === releaseName && rel.namespace === namespace);

      if (!release) {
        return result.error(`Release ${releaseName} didn't exist in ${namespace} namespace.`);
      }

      return result.ok({
        release: toHelmRelease(release),
        details: detailsResult.value,
      });
    };
  },
});

export default requestDetailedHelmReleaseInjectable;
