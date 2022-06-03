/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import downloadPlatformUpdateInjectable from "../download-platform-update/download-platform-update.injectable";
import updateIsBeingDownloadedInjectable from "../../../common/application-update/update-is-being-downloaded/update-is-being-downloaded.injectable";
import discoveredUpdateVersionInjectable from "../../../common/application-update/discovered-update-version/discovered-update-version.injectable";
import { action, runInAction } from "mobx";
import type { ProgressOfDownload } from "../../../common/application-update/progress-of-update-download/progress-of-update-download.injectable";
import progressOfUpdateDownloadInjectable from "../../../common/application-update/progress-of-update-download/progress-of-update-download.injectable";

const downloadUpdateInjectable = getInjectable({
  id: "download-update",

  instantiate: (di) => {
    const downloadPlatformUpdate = di.inject(downloadPlatformUpdateInjectable);
    const downloadingUpdateState = di.inject(updateIsBeingDownloadedInjectable);
    const discoveredVersionState = di.inject(discoveredUpdateVersionInjectable);
    const progressOfUpdateDownload = di.inject(progressOfUpdateDownloadInjectable);

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
          discoveredVersionState.set(null);
        }

        downloadingUpdateState.set(false);
      });

      return { downloadWasSuccessful };
    };
  },
});

export default downloadUpdateInjectable;
