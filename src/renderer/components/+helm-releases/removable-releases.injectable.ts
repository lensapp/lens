/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import releasesInjectable from "./releases.injectable";
import deleteReleaseInjectable from "./delete-release.injectable";
import { removableReleases } from "./removable-releases";

const removableReleasesInjectable = getInjectable({
  instantiate: (di) =>
    removableReleases({
      releases: di.inject(releasesInjectable),
      deleteRelease: di.inject(deleteReleaseInjectable),
      releaseSelectionStatus: observable.map<string, boolean>(),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default removableReleasesInjectable;
