/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import requestHelmReleaseRollbackInjectable from "../../../../common/k8s-api/endpoints/helm-releases.api/request-rollback.injectable";
import releasesInjectable from "../releases.injectable";

export type RollbackRelease = (name: string, namespace: string, revision: number) => Promise<void>;

const rollbackReleaseInjectable = getInjectable({
  id: "rollback-release",

  instantiate: (di): RollbackRelease => {
    const releases = di.inject(releasesInjectable);
    const requestHelmReleaseRollback = di.inject(requestHelmReleaseRollbackInjectable);

    return async (name, namespace, revision) => {
      await requestHelmReleaseRollback(name, namespace, revision);

      releases.invalidate();
    };
  },
});

export default rollbackReleaseInjectable;
