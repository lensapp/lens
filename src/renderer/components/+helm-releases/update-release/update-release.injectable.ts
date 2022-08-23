/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import releasesInjectable from "../releases.injectable";
import type { CallForHelmReleaseUpdate } from "./call-for-helm-release-update/call-for-helm-release-update.injectable";
import callForHelmReleaseUpdateInjectable from "./call-for-helm-release-update/call-for-helm-release-update.injectable";

const updateReleaseInjectable = getInjectable({
  id: "update-release",

  instantiate: (di): CallForHelmReleaseUpdate => {
    const releases = di.inject(releasesInjectable);
    const callForHelmReleaseUpdate = di.inject(callForHelmReleaseUpdateInjectable);

    return async (
      name,
      namespace,
      payload,
    ) => {
      const result = await callForHelmReleaseUpdate(name, namespace, payload);

      releases.invalidate();

      return result;
    };
  },
});

export default updateReleaseInjectable;
