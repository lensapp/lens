/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import updatingIsEnabledInjectable from "../../../updating-is-enabled/main/updating-is-enabled.injectable";
import { trayMenuItemInjectionToken } from "../../../../../../main/tray/tray-menu-item/tray-menu-item-injection-token";
import showApplicationWindowInjectable from "../../../../../../main/start-main-application/lens-window/show-application-window.injectable";
import discoveredUpdateVersionInjectable from "../../../../common/discovered-update-version.injectable";
import updateIsBeingDownloadedInjectable from "../../../../common/update-is-being-downloaded.injectable";
import updatesAreBeingDiscoveredInjectable from "../../../../common/updates-are-being-discovered.injectable";
import progressOfUpdateDownloadInjectable from "../../../../common/progress-of-update-download.injectable";
import assert from "assert";
import processCheckingForUpdatesInjectable from "../../../../main/process-checking-for-updates.injectable";
import { withErrorSuppression } from "../../../../../../common/utils/with-error-suppression/with-error-suppression";
import { pipeline } from "@ogre-tools/fp";
import withErrorLoggingInjectable from "../../../../../../common/utils/with-error-logging/with-error-logging.injectable";
import showMessagePopupInjectable from "../../../../../../main/electron-app/features/show-message-popup.injectable";

const checkForUpdatesTrayItemInjectable = getInjectable({
  id: "check-for-updates-tray-item",

  instantiate: (di) => {
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const updatingIsEnabled = di.inject(updatingIsEnabledInjectable);
    const progressOfUpdateDownload = di.inject(progressOfUpdateDownloadInjectable);
    const discoveredVersionState = di.inject(discoveredUpdateVersionInjectable);
    const downloadingUpdateState = di.inject(updateIsBeingDownloadedInjectable);
    const checkingForUpdatesState = di.inject(updatesAreBeingDiscoveredInjectable);
    const processCheckingForUpdates = di.inject(processCheckingForUpdatesInjectable);
    const withErrorLoggingFor = di.inject(withErrorLoggingInjectable);
    const showMessagePopup = di.inject(showMessagePopupInjectable);

    return {
      id: "check-for-updates",
      parentId: null,
      orderNumber: 30,

      label: computed(() => {
        if (downloadingUpdateState.value.get()) {
          const discoveredVersion = discoveredVersionState.value.get();

          assert(discoveredVersion);

          const roundedPercentage = Math.round(progressOfUpdateDownload.value.get().percentage);

          return `Downloading update ${discoveredVersion.version} (${roundedPercentage}%)...`;
        }

        if (checkingForUpdatesState.value.get()) {
          return "Checking for Updates...";
        }

        return "Check for Updates...";
      }),

      enabled: computed(() => !checkingForUpdatesState.value.get() && !downloadingUpdateState.value.get()),

      visible: computed(() => updatingIsEnabled),

      click: pipeline(
        async () => {
          const { updateIsReadyToBeInstalled } = await processCheckingForUpdates("tray");

          if (updateIsReadyToBeInstalled) {
            await showApplicationWindow();
          } else {
            showMessagePopup(
              "No Updates Available",
              "You're all good",
              "You've got the latest version of Lens,\nthanks for staying on the ball.",
              {
                textWidth: 300,
              },
            );
          }
        },

        withErrorLoggingFor(() => "[TRAY]: Checking for updates failed."),

        // TODO: Find out how to improve typing so that instead of
        // x => withErrorSuppression(x) there could only be withErrorSuppression
        (x) => withErrorSuppression(x),
      ),
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default checkForUpdatesTrayItemInjectable;
