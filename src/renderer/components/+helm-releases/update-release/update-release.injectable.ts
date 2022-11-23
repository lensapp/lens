/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import releasesInjectable from "../releases.injectable";
import type { RequestHelmReleaseUpdate } from "../../../../common/k8s-api/endpoints/helm-releases.api/request-update.injectable";
import requestHelmReleaseUpdateInjectable from "../../../../common/k8s-api/endpoints/helm-releases.api/request-update.injectable";

const updateReleaseInjectable = getInjectable({
  id: "update-release",

  instantiate: (di): RequestHelmReleaseUpdate => {
    const releases = di.inject(releasesInjectable);
    const requestHelmReleaseUpdate = di.inject(requestHelmReleaseUpdateInjectable);

    return async (
      name,
      namespace,
      payload,
    ) => {
      const result = await requestHelmReleaseUpdate(name, namespace, payload);

      releases.invalidate();

      return result;
    };
  },
});

export default updateReleaseInjectable;
