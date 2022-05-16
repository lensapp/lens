/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronUpdaterInjectable from "../../electron-app/features/electron-updater.injectable";
import type { UpdateChannel } from "../update-channels";
import loggerInjectable from "../../../common/logger.injectable";
import type { UpdateCheckResult } from "electron-updater";

export type CheckForPlatformUpdates = (updateChannel: UpdateChannel) => Promise<{ updateWasDiscovered: boolean; version?: string }>;

const checkForPlatformUpdatesInjectable = getInjectable({
  id: "check-for-platform-updates",

  instantiate: (di): CheckForPlatformUpdates => {
    const electronUpdater = di.inject(electronUpdaterInjectable);
    const logger = di.inject(loggerInjectable);

    return async (updateChannel) => {
      electronUpdater.channel = updateChannel.id;
      electronUpdater.autoDownload = false;

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
