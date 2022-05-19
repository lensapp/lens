/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CheckForPlatformUpdates } from "../check-for-platform-updates/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "../check-for-platform-updates/check-for-platform-updates.injectable";
import type { UpdateChannel } from "../update-channels";
import selectedUpdateChannelInjectable from "../selected-update-channel.injectable";
import updatesAreBeingDiscoveredInjectable from "../../../common/application-update/updates-are-being-discovered/updates-are-being-discovered.injectable";
import discoveredUpdateVersionInjectable from "../../../common/application-update/discovered-update-version/discovered-update-version.injectable";
import { runInAction } from "mobx";
import assert from "assert";
import applicationUpdateStatusChannelInjectable from "../../../common/application-update/application-update-status-channel.injectable";
import { sendToAgnosticChannelInjectionToken } from "../../../common/channel/send-to-agnostic-channel-injection-token";

const checkForUpdatesInjectable = getInjectable({
  id: "check-for-updates",

  instantiate: (di) => {
    const selectedUpdateChannel = di.inject(selectedUpdateChannelInjectable);
    const sendToAgnosticChannel = di.inject(sendToAgnosticChannelInjectionToken);
    const applicationUpdateStatusChannel = di.inject(applicationUpdateStatusChannelInjectable);

    const checkForPlatformUpdates = di.inject(
      checkForPlatformUpdatesInjectable,
    );

    const checkingForUpdatesState = di.inject(
      updatesAreBeingDiscoveredInjectable,
    );

    const discoveredVersionState = di.inject(discoveredUpdateVersionInjectable);

    return async () => {
      runInAction(() => {
        checkingForUpdatesState.set(true);
      });

      const checkForUpdatesStartingFromChannel =
        checkForUpdatesStartingFromChannelFor(checkForPlatformUpdates);

      sendToAgnosticChannel(applicationUpdateStatusChannel, { eventId: "checking-for-updates" });

      const { updateWasDiscovered, version, actualUpdateChannel } =
        await checkForUpdatesStartingFromChannel(selectedUpdateChannel.value.get());

      if (!updateWasDiscovered) {
        sendToAgnosticChannel(applicationUpdateStatusChannel, { eventId: "no-updates-available" });
      }

      runInAction(() => {
        if (!updateWasDiscovered) {
          discoveredVersionState.set(null);
        } else {

          // TODO: Unacceptable damage caused by strict mode
          assert(version);
          assert(actualUpdateChannel);

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
