/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import updatingIsEnabledInjectable from "./updating-is-enabled.injectable";
import { trayMenuItemInjectionToken } from "../tray/tray-menu-item/tray-menu-item-injection-token";
import showApplicationWindowInjectable from "../start-main-application/lens-window/show-application-window.injectable";
import showNotificationInjectable from "../show-notification/show-notification.injectable";
import askBooleanInjectable from "../ask-boolean/ask-boolean.injectable";
import quitAndInstallUpdateInjectable from "../electron-app/features/quit-and-install-update.injectable";
import discoveredVersionStateInjectable from "../../common/application-update/discovered-version/discovered-version-state.injectable";
import downloadingUpdateStateInjectable from "../../common/application-update/downloading-update/downloading-update-state.injectable";
import checkingForUpdatesStateInjectable from "../../common/application-update/checking-for-updates/checking-for-updates-state.injectable";
import checkForUpdatesInjectable from "./check-for-updates/check-for-updates.injectable";
import downloadUpdateInjectable from "./download-update/download-update.injectable";
import progressOfUpdateDownloadInjectable from "../../common/application-update/progress-of-update-download/progress-of-update-download.injectable";

const checkForUpdatesTrayItemInjectable = getInjectable({
  id: "check-for-updates-tray-item",

  instantiate: (di) => {
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const updatingIsEnabled = di.inject(updatingIsEnabledInjectable);
    const progressOfUpdateDownload = di.inject(progressOfUpdateDownloadInjectable);
    const showNotification = di.inject(showNotificationInjectable);
    const askBoolean = di.inject(askBooleanInjectable);
    const quitAndInstallUpdate = di.inject(quitAndInstallUpdateInjectable);
    const discoveredVersionState = di.inject(discoveredVersionStateInjectable);
    const downloadingUpdateState = di.inject(downloadingUpdateStateInjectable);
    const checkingForUpdatesState = di.inject(checkingForUpdatesStateInjectable);
    const checkForUpdates = di.inject(checkForUpdatesInjectable);
    const downloadUpdate = di.inject(downloadUpdateInjectable);

    return {
      id: "check-for-updates",
      parentId: null,
      orderNumber: 30,

      label: computed(() => {
        if (downloadingUpdateState.value.get()) {
          return `Downloading update ${discoveredVersionState.value.get().version} (${progressOfUpdateDownload.value.get()}%)...`;
        }

        if (checkingForUpdatesState.value.get()) {
          return "Checking for updates...";
        }

        return "Check for updates";
      }),

      enabled: computed(() => !checkingForUpdatesState.value.get() && !downloadingUpdateState.value.get()),

      visible: computed(() => updatingIsEnabled),

      click: async () => {
        const { updateWasDiscovered, version } = await checkForUpdates();

        if (updateWasDiscovered) {
          showNotification(`Download for version ${version} started...`);

          // Note: intentional orphan promise to make download happen in the background
          downloadUpdate().then(async ({ downloadWasSuccessful }) => {

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
