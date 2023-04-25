/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import downloadPlatformUpdateInjectable from "./download-platform-update/download-platform-update.injectable";
import updateIsBeingDownloadedInjectable from "../../common/update-is-being-downloaded.injectable";
import discoveredUpdateVersionInjectable from "../../common/discovered-update-version.injectable";
import { action, runInAction } from "mobx";
import type { ProgressOfDownload } from "../../common/progress-of-update-download.injectable";
import progressOfUpdateDownloadInjectable from "../../common/progress-of-update-download.injectable";
import { getCurrentDateTime } from "../../../../common/utils/date/get-current-date-time";
import updateDownloadedDateTimeInjectable from "../../common/update-downloaded-date-time.injectable";

const downloadUpdateInjectable = getInjectable({
  id: "download-update",

  instantiate: (di) => {
    const downloadPlatformUpdate = di.inject(downloadPlatformUpdateInjectable);
    const downloadingUpdateState = di.inject(updateIsBeingDownloadedInjectable);
    const discoveredVersionState = di.inject(discoveredUpdateVersionInjectable);
    const progressOfUpdateDownload = di.inject(progressOfUpdateDownloadInjectable);
    const updateDownloadedDate = di.inject(updateDownloadedDateTimeInjectable);

    const updateDownloadProgress = action((progressOfDownload: ProgressOfDownload) => {
      progressOfUpdateDownload.set(progressOfDownload);
    });

    return async () => {
      runInAction(() => {
        progressOfUpdateDownload.set({ percentage: 0 });
        downloadingUpdateState.set(true);
      });

      const { downloadWasSuccessful } = await downloadPlatformUpdate(
        updateDownloadProgress,
      );

      runInAction(() => {
        if (!downloadWasSuccessful) {
          progressOfUpdateDownload.set({ percentage: 0, failed: "Download of update failed" });
          discoveredVersionState.set(null);
          updateDownloadedDate.set(null);
        } else {
          const currentDateTime = getCurrentDateTime();

          updateDownloadedDate.set(currentDateTime);
        }

        downloadingUpdateState.set(false);
      });

      return { downloadWasSuccessful };
    };
  },
});

export default downloadUpdateInjectable;
