/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronUpdaterInjectable from "../../electron-app/features/electron-updater.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import type { ProgressInfo } from "electron-updater";

export type DownloadPlatformUpdate = (
  onDownloadProgress: (percentage: number) => void
) => Promise<{ downloadWasSuccessful: boolean }>;

const downloadPlatformUpdateInjectable = getInjectable({
  id: "download-platform-update",

  instantiate: (di): DownloadPlatformUpdate => {
    const electronUpdater = di.inject(electronUpdaterInjectable);
    const logger = di.inject(loggerInjectable);

    return async (onDownloadProgress) => {
      onDownloadProgress(0);

      const updateDownloadProgress = ({ percent }: ProgressInfo) => onDownloadProgress(percent);

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
