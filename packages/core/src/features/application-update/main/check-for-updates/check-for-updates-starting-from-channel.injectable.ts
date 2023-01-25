/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { UpdateChannel } from "../../common/update-channels";
import checkForPlatformUpdatesInjectable from "./check-for-platform-updates/check-for-platform-updates.injectable";
import updateCanBeDowngradedInjectable from "./update-can-be-downgraded.injectable";

export type CheckForUpdatesFromChannelResult = {
  updateWasDiscovered: false;
} | {
  updateWasDiscovered: true;
  version: string;
  actualUpdateChannel: UpdateChannel;
};

const checkForUpdatesStartingFromChannelInjectable = getInjectable({
  id: "check-for-updates-starting-from-channel",

  instantiate: (di) => {
    const checkForPlatformUpdates = di.inject(checkForPlatformUpdatesInjectable);
    const updateCanBeDowngraded = di.inject(updateCanBeDowngradedInjectable);

    const _recursiveCheck = async (
      updateChannel: UpdateChannel,
    ): Promise<CheckForUpdatesFromChannelResult> => {
      const result = await checkForPlatformUpdates(updateChannel, {
        allowDowngrade: updateCanBeDowngraded.get(),
      });

      if (result.updateWasDiscovered) {
        return {
          updateWasDiscovered: true,
          version: result.version,
          actualUpdateChannel: updateChannel,
        };
      }

      if (updateChannel.moreStableUpdateChannel) {
        return await _recursiveCheck(updateChannel.moreStableUpdateChannel);
      }

      return { updateWasDiscovered: false };
    };

    return _recursiveCheck;
  },
});

export default checkForUpdatesStartingFromChannelInjectable;
