/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmReleaseDto } from "../../../../../../common/k8s-api/endpoints/helm-releases.api";
import callForHelmReleasesInjectable from "../../../call-for-helm-releases/call-for-helm-releases.injectable";
import type { HelmReleaseDetails } from "./call-for-helm-release-details/call-for-helm-release-details.injectable";
import callForHelmReleaseDetailsInjectable from "./call-for-helm-release-details/call-for-helm-release-details.injectable";
import type { AsyncResult } from "../../../../../../common/utils/async-result";

export interface DetailedHelmRelease {
  release: HelmReleaseDto;
  details: HelmReleaseDetails;
}

export type CallForHelmRelease = (
  name: string,
  namespace: string
) => Promise<AsyncResult<DetailedHelmRelease | undefined>>;

const callForHelmReleaseInjectable = getInjectable({
  id: "call-for-helm-release",

  instantiate: (di): CallForHelmRelease => {
    const callForHelmReleases = di.inject(callForHelmReleasesInjectable);
    const callForHelmReleaseDetails = di.inject(callForHelmReleaseDetailsInjectable);

    return async (name, namespace) => {
      const [releases, details] = await Promise.all([
        callForHelmReleases(namespace),
        callForHelmReleaseDetails(name, namespace),
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

export default callForHelmReleaseInjectable;
