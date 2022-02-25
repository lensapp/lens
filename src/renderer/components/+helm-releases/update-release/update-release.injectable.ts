/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import {
  IReleaseUpdatePayload,
  updateRelease,
} from "../../../../common/k8s-api/endpoints/helm-releases.api";
import releasesInjectable from "../releases.injectable";

const updateReleaseInjectable = getInjectable({
  id: "update-release",

  instantiate: (di) => {
    const releases = di.inject(releasesInjectable);

    return async (
      name: string,
      namespace: string,
      payload: IReleaseUpdatePayload,
    ) => {
      const result = await updateRelease(name, namespace, payload);

      releases.invalidate();

      return result;
    };
  },
});

export default updateReleaseInjectable;
