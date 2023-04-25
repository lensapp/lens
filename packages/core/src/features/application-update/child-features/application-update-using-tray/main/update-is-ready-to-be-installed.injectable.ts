/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import discoveredUpdateVersionInjectable from "../../../common/discovered-update-version.injectable";
import updateIsBeingDownloadedInjectable from "../../../common/update-is-being-downloaded.injectable";

const updateIsReadyToBeInstalledInjectable = getInjectable({
  id: "update-is-ready-to-be-installed",

  instantiate: (di) => {
    const discoveredUpdateVersion = di.inject(discoveredUpdateVersionInjectable);
    const updateIsBeingDownloaded = di.inject(updateIsBeingDownloadedInjectable);

    return computed(
      () =>
        !!discoveredUpdateVersion.value.get() &&
        !updateIsBeingDownloaded.value.get(),
    );
  },
});

export default updateIsReadyToBeInstalledInjectable;
