/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronUpdaterInjectable from "../../../../../main/electron-app/features/electron-updater.injectable";
import type { UpdateChannel } from "../../../common/update-channels";
import { loggerInjectionToken } from "@k8slens/logger";
import type { UpdateCheckResult } from "electron-updater";

export type CheckForUpdatesResult = {
  updateWasDiscovered: false;
} | {
  updateWasDiscovered: true;
  version: string;
};

export type CheckForPlatformUpdates = (updateChannel: UpdateChannel, opts: { allowDowngrade: boolean }) => Promise<CheckForUpdatesResult>;

const checkForPlatformUpdatesInjectable = getInjectable({
  id: "check-for-platform-updates",

  instantiate: (di): CheckForPlatformUpdates => {
    const electronUpdater = di.inject(electronUpdaterInjectable);
    const logger = di.inject(loggerInjectionToken);

    return async (updateChannel, { allowDowngrade }) => {
      electronUpdater.channel = updateChannel.id;
      electronUpdater.autoDownload = false;
      electronUpdater.allowDowngrade = allowDowngrade;

      let result: UpdateCheckResult;

      try {
        result = await electronUpdater.checkForUpdates();
      } catch (error) {
        logger.error("[UPDATE-APP/CHECK-FOR-UPDATES]", error);

        return {
          updateWasDiscovered: false,
        };
      }

      const { updateInfo, cancellationToken } = result;

      if (!cancellationToken) {
        return {
          updateWasDiscovered: false,
        };
      }

      return {
        updateWasDiscovered: true,
        version: updateInfo.version,
      };
    };
  },
});

export default checkForPlatformUpdatesInjectable;
