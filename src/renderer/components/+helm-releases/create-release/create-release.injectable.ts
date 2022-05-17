/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import type {
  HelmReleaseCreatePayload } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import {
  createRelease,
} from "../../../../common/k8s-api/endpoints/helm-releases.api";
import releasesInjectable from "../releases.injectable";

const createReleaseInjectable = getInjectable({
  id: "create-release",

  instantiate: (di) => {
    const releases = di.inject(releasesInjectable);

    return async (payload: HelmReleaseCreatePayload) => {
      const release = await createRelease(payload);

      releases.invalidate();

      return release;
    };
  },
});

export default createReleaseInjectable;
