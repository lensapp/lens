/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ProgressInfo } from "electron-updater";
import electronUpdaterInjectable from "../../electron-app/features/electron-updater.injectable";
import progressOfUpdateDownloadInjectable from "../progress-of-update-download.injectable";
import loggerInjectable from "../../../common/logger.injectable";

const downloadPlatformUpdateInjectable = getInjectable({
  id: "download-platform-update",

  instantiate: (di) => {
    const electronUpdater = di.inject(electronUpdaterInjectable);
    const progressOfUpdateDownload = di.inject(progressOfUpdateDownloadInjectable);
    const logger = di.inject(loggerInjectable);

    const updateDownloadProgress = ({ percent }: ProgressInfo) => {
      progressOfUpdateDownload.setValue(percent);
    };

    return async () => {
      progressOfUpdateDownload.setValue(0);

      electronUpdater.on("download-progress", updateDownloadProgress);

      try {
        await electronUpdater.downloadUpdate();
      } catch(error) {
        logger.error("[UPDATE-APP/DOWNLOAD]", error);

        return { downloadWasSuccessful: false };
      } finally {
        electronUpdater.off("download-progress", updateDownloadProgress);
      }

      return { downloadWasSuccessful: true };
    };
  },
});

export default downloadPlatformUpdateInjectable;
