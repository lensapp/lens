/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { rollbackRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import releasesInjectable from "../releases.injectable";

const rollbackReleaseInjectable = getInjectable({
  id: "rollback-release",

  instantiate: (di) => {
    const releases = di.inject(releasesInjectable);

    return async (name: string, namespace: string, revision: number) => {
      await rollbackRelease(name, namespace, revision);

      releases.invalidate();
    };
  },
});

export default rollbackReleaseInjectable;
