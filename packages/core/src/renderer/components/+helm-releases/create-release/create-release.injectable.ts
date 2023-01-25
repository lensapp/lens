/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import releasesInjectable from "../releases.injectable";
import type { RequestCreateHelmRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api/request-create.injectable";
import requestCreateHelmReleaseInjectable from "../../../../common/k8s-api/endpoints/helm-releases.api/request-create.injectable";

const createReleaseInjectable = getInjectable({
  id: "create-release",

  instantiate: (di): RequestCreateHelmRelease => {
    const releases = di.inject(releasesInjectable);
    const callForCreateRelease = di.inject(requestCreateHelmReleaseInjectable);

    return async (payload) => {
      const release = await callForCreateRelease(payload);

      releases.invalidate();

      return release;
    };
  },
});

export default createReleaseInjectable;
