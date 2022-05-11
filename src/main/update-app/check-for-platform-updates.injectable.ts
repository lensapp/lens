/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronUpdaterInjectable from "../electron-app/features/electron-updater.injectable";
import type { UpdateChannel } from "./update-channels";

export type CheckForPlatformUpdates = (updateChannel: UpdateChannel) => Promise<{ updateWasDiscovered: boolean; version?: string }>;

const checkForPlatformUpdatesInjectable = getInjectable({
  id: "check-for-platform-updates",

  instantiate: (di): CheckForPlatformUpdates => {
    const electronUpdater = di.inject(electronUpdaterInjectable);

    return async (updateChannel) => {
      electronUpdater.channel = updateChannel.id;

      await electronUpdater.checkForUpdates();

      return {
        updateWasDiscovered: true,
        version: "42",
      };
    };
  },
});

export default checkForPlatformUpdatesInjectable;
