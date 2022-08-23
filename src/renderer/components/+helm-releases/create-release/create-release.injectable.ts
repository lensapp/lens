/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import releasesInjectable from "../releases.injectable";
import type { CallForCreateHelmRelease } from "./call-for-create-helm-release.injectable";
import callForCreateHelmReleaseInjectable from "./call-for-create-helm-release.injectable";

const createReleaseInjectable = getInjectable({
  id: "create-release",

  instantiate: (di): CallForCreateHelmRelease => {
    const releases = di.inject(releasesInjectable);
    const callForCreateRelease = di.inject(callForCreateHelmReleaseInjectable);

    return async (payload) => {
      const release = await callForCreateRelease(payload);

      releases.invalidate();

      return release;
    };
  },
});

export default createReleaseInjectable;
