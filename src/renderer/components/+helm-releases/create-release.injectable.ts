/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import {
  createRelease,
  IReleaseCreatePayload,
} from "../../../common/k8s-api/endpoints/helm-release.api";
import releasesInjectable from "./releases.injectable";

const createReleaseInjectable = getInjectable({
  instantiate: (di) => {
    const releases = di.inject(releasesInjectable);

    return async (payload: IReleaseCreatePayload) => {
      const release = await createRelease(payload);

      releases.invalidate();

      return release;
    };
  },

  lifecycle: lifecycleEnum.singleton,
});

export default createReleaseInjectable;
