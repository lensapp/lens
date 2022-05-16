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
import showNotificationInjectable from "../show-notification/show-notification.injectable";
import askBooleanInjectable from "../ask-boolean/ask-boolean.injectable";
import quitAndInstallUpdateInjectable from "../electron-app/features/quit-and-install-update.injectable";

const checkForUpdatesTrayItemInjectable = getInjectable({
  id: "check-for-updates-tray-item",

  instantiate: (di) => {
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const updatingIsEnabled = di.inject(updatingIsEnabledInjectable);
    const versionUpdate = di.inject(versionUpdateInjectable);
    const progressOfUpdateDownload = di.inject(progressOfUpdateDownloadInjectable);
    const showNotification = di.inject(showNotificationInjectable);
    const askBoolean = di.inject(askBooleanInjectable);
    const quitAndInstallUpdate = di.inject(quitAndInstallUpdateInjectable);

    return {
      id: "check-for-updates",
      parentId: null,
      orderNumber: 30,

      label: computed(() => {
        if (versionUpdate.downloading.get()) {
          return `Downloading update ${versionUpdate.discoveredVersion.get()} (${progressOfUpdateDownload.value.get()}%)...`;
        }

        if (versionUpdate.checking.get()) {
          return "Checking for updates...";
        }

        return "Check for updates";
      }),

      enabled: computed(() => !versionUpdate.checking.get() && !versionUpdate.downloading.get()),

      visible: computed(() => updatingIsEnabled),

      click: async () => {
        const { updateWasDiscovered, version } = await versionUpdate.checkForUpdates();

        if (updateWasDiscovered) {
          showNotification(`Download for version ${version} started...`);

          // Note: intentional orphan promise to make download happen in the background
          versionUpdate.downloadUpdate().then(async ({ downloadWasSuccessful }) => {

            if (!downloadWasSuccessful) {
              showNotification(`Download for update failed`);

              return;
            }

            const userWantsToInstallUpdate = await askBoolean(`Do you want to install update ${version}?`);

            if (userWantsToInstallUpdate) {
              quitAndInstallUpdate();
            }
          });
        }

        await showApplicationWindow();
      },
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default checkForUpdatesTrayItemInjectable;
