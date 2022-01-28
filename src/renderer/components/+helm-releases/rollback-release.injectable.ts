/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { rollbackRelease } from "../../../common/k8s-api/endpoints/helm-release.api";
import releasesInjectable from "./releases.injectable";

const rollbackReleaseInjectable = getInjectable({
  instantiate: (di) => {
    const releases = di.inject(releasesInjectable);

    return async (name: string, namespace: string, revision: number) => {
      await rollbackRelease(name, namespace, revision);

      releases.invalidate();
    };
  },
  lifecycle: lifecycleEnum.singleton,
});

export default rollbackReleaseInjectable;
