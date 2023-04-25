/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import getTrayIconPathInjectable from "../../../../../../main/tray/menu-icon/get-tray-icon-path.injectable";
import { trayIconInjectionToken } from "../../../../../../main/tray/menu-icon/tray-icon-injection-token";
import updatesAreBeingDiscoveredInjectable from "../../../../common/updates-are-being-discovered.injectable";
import updateIsBeingDownloadedInjectable from "../../../../common/update-is-being-downloaded.injectable";

const checkingForUpdatesTrayIconInjectable = getInjectable({
  id: "checking-for-updates-tray-icon",

  instantiate: (di) => {
    const getTrayIconPath = di.inject(getTrayIconPathInjectable);
    const updatesAreBeingDiscovered = di.inject(updatesAreBeingDiscoveredInjectable);
    const updateIsBeingDownloaded = di.inject(updateIsBeingDownloadedInjectable);

    return {
      iconPath: getTrayIconPath("checking-for-updates"),
      priority: 1,
      shouldBeShown: computed(
        () =>
          updatesAreBeingDiscovered.value.get() ||
          updateIsBeingDownloaded.value.get(),
      ),
    };
  },

  injectionToken: trayIconInjectionToken,
});

export default checkingForUpdatesTrayIconInjectable;
