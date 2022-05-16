/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed, runInAction } from "mobx";
import selectedUpdateChannelInjectable from "./selected-update-channel.injectable";
import downloadPlatformUpdateInjectable from "./download-platform-update/download-platform-update.injectable";
import type { CheckForPlatformUpdates } from "./check-for-platform-updates/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "./check-for-platform-updates/check-for-platform-updates.injectable";
import type { UpdateChannel } from "./update-channels";
import showNotificationInjectable from "../show-notification/show-notification.injectable";
import checkingForUpdatesStateInjectable from "../../common/application-update/checking-for-updates/checking-for-updates-state.injectable";
import type { SyncBox } from "../../common/sync-box/create-sync-box.injectable";
import downloadingUpdateStateInjectable from "../../common/application-update/downloading-update/downloading-update-state.injectable";
import discoveredVersionStateInjectable from "../../common/application-update/discovered-version/discovered-version-state.injectable";

const versionUpdateInjectable = getInjectable({
  id: "version-update",

  instantiate: (di) => {
    const selectedUpdateChannel = di.inject(selectedUpdateChannelInjectable);
    const downloadPlatformUpdate = di.inject(downloadPlatformUpdateInjectable);
    const checkForPlatformUpdates = di.inject(checkForPlatformUpdatesInjectable);
    const showNotification = di.inject(showNotificationInjectable);
    const checkingForUpdatesState = di.inject(checkingForUpdatesStateInjectable);
    const downloadingUpdateState = di.inject(downloadingUpdateStateInjectable);
    const discoveredVersionState = di.inject(discoveredVersionStateInjectable);

    return {
      discoveredVersion: computed(() => {
        const discoveredVersion = discoveredVersionState.value.get();

        return discoveredVersion?.version;
      }),

      discoveredFromUpdateChannel: computed(() => {
        const discoveredVersion = discoveredVersionState.value.get();

        return discoveredVersion?.updateChannel;
      }),

      downloading: computed(() => downloadingUpdateState.value.get()),
      checking: computed(() => checkingForUpdatesState.value.get()),

      checkForUpdates: checkForUpdatesFor(
        checkForPlatformUpdates,
        discoveredVersionState,
        selectedUpdateChannel.value,
        showNotification,
        checkingForUpdatesState,
      ),

      downloadUpdate: downloadUpdateFor(
        downloadPlatformUpdate,
        downloadingUpdateState,
      ),
    };
  },
});

export default versionUpdateInjectable;

const downloadUpdateFor =
  (
    downloadPlatformUpdate: () => Promise<{ downloadWasSuccessful: boolean }>,
    downloadingUpdateState: SyncBox<boolean>,
  ) =>
    async () => {
      runInAction(() => {
        downloadingUpdateState.set(true);
      });

      await downloadPlatformUpdate();

      runInAction(() => {
        downloadingUpdateState.set(false);
      });
    };

const checkForUpdatesFor =
  (
    checkForPlatformUpdates: CheckForPlatformUpdates,
    discoveredVersionState: SyncBox<{ version: string; updateChannel: UpdateChannel }>,
    selectedUpdateChannel: IComputedValue<UpdateChannel>,
    showNotification: (message: string) => void,
    checkingForUpdatesState: SyncBox<boolean>,
  ) =>
    async () => {
      runInAction(() => {
        checkingForUpdatesState.set(true);
      });

      const checkForUpdatesStartingFromChannel =
        checkForUpdatesStartingFromChannelFor(checkForPlatformUpdates);

      showNotification("Checking for updates...");

      const { updateWasDiscovered, version, actualUpdateChannel } = await checkForUpdatesStartingFromChannel(
        selectedUpdateChannel.get(),
      );

      if (!updateWasDiscovered) {
        showNotification("No new updates available");
      }

      runInAction(() => {
        discoveredVersionState.set({ version, updateChannel: actualUpdateChannel });
        checkingForUpdatesState.set(false);
      });

      return { updateWasDiscovered, version };
    };


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
