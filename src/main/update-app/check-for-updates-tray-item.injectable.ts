/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import updatingIsEnabledInjectable from "./updating-is-enabled.injectable";
import { trayMenuItemInjectionToken } from "../tray/tray-menu-item/tray-menu-item-injection-token";
import versionUpdateInjectable from "./version-update.injectable";
import progressOfUpdateDownloadInjectable from "./progress-of-update-download.injectable";
import showApplicationWindowInjectable from "../start-main-application/lens-window/show-application-window.injectable";

const checkForUpdatesTrayItemInjectable = getInjectable({
  id: "check-for-updates-tray-item",

  instantiate: (di) => {
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const updatingIsEnabled = di.inject(updatingIsEnabledInjectable);
    const versionUpdate = di.inject(versionUpdateInjectable);
    const progressOfUpdateDownload = di.inject(progressOfUpdateDownloadInjectable);

    return {
      id: "check-for-updates",
      parentId: null,
      orderNumber: 30,

      label: computed(() => {
        if (versionUpdate.downloading.get()) {
          return `Downloading update "${versionUpdate.discoveredVersion.get()}" (${progressOfUpdateDownload.value.get()}%)...`;
        }

        if (versionUpdate.checking.get()) {
          return "Checking for updates...";
        }

        return "Check for updates";
      }),

      enabled: computed(() => !versionUpdate.checking.get() && !versionUpdate.downloading.get()),

      visible: computed(() => updatingIsEnabled),

      click: async () => {
        const { updateWasDiscovered } = await versionUpdate.checkForUpdates();

        if (updateWasDiscovered) {
          versionUpdate.downloadUpdate();
        }


        // await showApplicationWindow();
      },
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default checkForUpdatesTrayItemInjectable;
