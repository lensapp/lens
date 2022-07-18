/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import releaseInjectable from "./release.injectable";
import { waitUntilDefined } from "../../../utils";
import getHelmReleaseDetailsInjectable from "../../../k8s/helm-releases.api/get-details.injectable";

const releaseDetailsInjectable = getInjectable({
  id: "release-details",

  instantiate: (di) => {
    const releaseComputed = di.inject(releaseInjectable);
    const getHelmReleaseDetails = di.inject(getHelmReleaseDetailsInjectable);

    return asyncComputed(async () => {
      const release = await waitUntilDefined(releaseComputed);

      return getHelmReleaseDetails(release.name, release.namespace);
    });},
});

export default releaseDetailsInjectable;
