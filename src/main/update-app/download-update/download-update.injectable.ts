/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import downloadPlatformUpdateInjectable from "../download-platform-update/download-platform-update.injectable";
import downloadingUpdateStateInjectable from "../../../common/application-update/downloading-update/downloading-update-state.injectable";
import discoveredVersionStateInjectable from "../../../common/application-update/discovered-version/discovered-version-state.injectable";
import { action, runInAction } from "mobx";
import progressOfUpdateDownloadInjectable from "../../../common/application-update/progress-of-update-download/progress-of-update-download.injectable";

const downloadUpdateInjectable = getInjectable({
  id: "download-update",

  instantiate: (di) => {
    const downloadPlatformUpdate = di.inject(downloadPlatformUpdateInjectable);
    const downloadingUpdateState = di.inject(downloadingUpdateStateInjectable);
    const discoveredVersionState = di.inject(discoveredVersionStateInjectable);
    const progressOfUpdateDownload = di.inject(progressOfUpdateDownloadInjectable);

    const updateDownloadProgress = action((percentage: number) => {
      progressOfUpdateDownload.set(percentage);
    });

    return async () => {
      runInAction(() => {
        progressOfUpdateDownload.set(0);
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
