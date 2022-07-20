/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import type {
  HelmReleaseCreatePayload } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import releasesInjectable from "../releases.injectable";
import callForCreateHelmReleaseInjectable from "./call-for-create-helm-release.injectable";

const createReleaseInjectable = getInjectable({
  id: "create-release",

  instantiate: (di) => {
    const releases = di.inject(releasesInjectable);
    const callForCreateRelease = di.inject(callForCreateHelmReleaseInjectable);

    return async (payload: HelmReleaseCreatePayload) => {
      const release = await callForCreateRelease(payload);

      releases.invalidate();

      return release;
    };
  },
});

export default createReleaseInjectable;
