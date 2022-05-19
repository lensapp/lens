/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import updatingIsEnabledInjectable from "./updating-is-enabled.injectable";
import { trayMenuItemInjectionToken } from "../tray/tray-menu-item/tray-menu-item-injection-token";
import showApplicationWindowInjectable from "../start-main-application/lens-window/show-application-window.injectable";
import discoveredUpdateVersionInjectable from "../../common/application-update/discovered-update-version/discovered-update-version.injectable";
import updateIsBeingDownloadedInjectable from "../../common/application-update/update-is-being-downloaded/update-is-being-downloaded.injectable";
import updatesAreBeingDiscoveredInjectable from "../../common/application-update/updates-are-being-discovered/updates-are-being-discovered.injectable";
import progressOfUpdateDownloadInjectable from "../../common/application-update/progress-of-update-download/progress-of-update-download.injectable";
import assert from "assert";
import checkForUpdatesInjectable from "./check-for-updates/check-for-updates.injectable";

const checkForUpdatesTrayItemInjectable = getInjectable({
  id: "check-for-updates-tray-item",

  instantiate: (di) => {
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const updatingIsEnabled = di.inject(updatingIsEnabledInjectable);
    const progressOfUpdateDownload = di.inject(progressOfUpdateDownloadInjectable);
    const discoveredVersionState = di.inject(discoveredUpdateVersionInjectable);
    const downloadingUpdateState = di.inject(updateIsBeingDownloadedInjectable);
    const checkingForUpdatesState = di.inject(updatesAreBeingDiscoveredInjectable);
    const checkForUpdates = di.inject(checkForUpdatesInjectable);

    return {
      id: "check-for-updates",
      parentId: null,
      orderNumber: 30,

      label: computed(() => {
        if (downloadingUpdateState.value.get()) {
          const discoveredVersion = discoveredVersionState.value.get();

          assert(discoveredVersion);

          return `Downloading update ${discoveredVersion.version} (${progressOfUpdateDownload.value.get()}%)...`;
        }

        if (checkingForUpdatesState.value.get()) {
          return "Checking for updates...";
        }

        return "Check for updates";
      }),

      enabled: computed(() => !checkingForUpdatesState.value.get() && !downloadingUpdateState.value.get()),

      visible: computed(() => updatingIsEnabled),

      click: async () => {
        await checkForUpdates();

        await showApplicationWindow();
      },
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default checkForUpdatesTrayItemInjectable;
