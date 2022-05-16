/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CheckForPlatformUpdates } from "../check-for-platform-updates/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "../check-for-platform-updates/check-for-platform-updates.injectable";
import type { UpdateChannel } from "../update-channels";
import selectedUpdateChannelInjectable from "../selected-update-channel.injectable";
import showNotificationInjectable from "../../show-notification/show-notification.injectable";
import checkingForUpdatesStateInjectable from "../../../common/application-update/checking-for-updates/checking-for-updates-state.injectable";
import discoveredVersionStateInjectable from "../../../common/application-update/discovered-version/discovered-version-state.injectable";
import { runInAction } from "mobx";

const checkForUpdatesInjectable = getInjectable({
  id: "check-for-updates",

  instantiate: (di) => {
    const selectedUpdateChannel = di.inject(selectedUpdateChannelInjectable);
    const showNotification = di.inject(showNotificationInjectable);

    const checkForPlatformUpdates = di.inject(
      checkForPlatformUpdatesInjectable,
    );

    const checkingForUpdatesState = di.inject(
      checkingForUpdatesStateInjectable,
    );

    const discoveredVersionState = di.inject(discoveredVersionStateInjectable);

    return async () => {
      runInAction(() => {
        checkingForUpdatesState.set(true);
      });

      const checkForUpdatesStartingFromChannel =
        checkForUpdatesStartingFromChannelFor(checkForPlatformUpdates);

      showNotification("Checking for updates...");

      const { updateWasDiscovered, version, actualUpdateChannel } =
        await checkForUpdatesStartingFromChannel(selectedUpdateChannel.value.get());

      if (!updateWasDiscovered) {
        showNotification("No new updates available");
      }

      runInAction(() => {
        if (!updateWasDiscovered) {
          discoveredVersionState.set(null);
        } else {
          discoveredVersionState.set({
            version,
            updateChannel: actualUpdateChannel,
          });
        }

        checkingForUpdatesState.set(false);
      });

      return { updateWasDiscovered, version };
    };
  },
});

export default checkForUpdatesInjectable;

const checkForUpdatesStartingFromChannelFor = (
  checkForPlatformUpdates: CheckForPlatformUpdates,
) => {
  const _recursiveCheck = async (
    updateChannel: UpdateChannel,
  ): Promise<{
    updateWasDiscovered: boolean;
    version?: string;
    actualUpdateChannel?: UpdateChannel;
  }> => {
    const result = await checkForPlatformUpdates(updateChannel);

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
};
