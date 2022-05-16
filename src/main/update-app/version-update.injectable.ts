/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue, IObservableValue } from "mobx";
import { computed, observable, runInAction } from "mobx";
import selectedUpdateChannelInjectable from "./selected-update-channel.injectable";
import downloadPlatformUpdateInjectable from "./download-platform-update.injectable";
import type { CheckForPlatformUpdates } from "./check-for-platform-updates/check-for-platform-updates.injectable";
import checkForPlatformUpdatesInjectable from "./check-for-platform-updates/check-for-platform-updates.injectable";
import type { UpdateChannel } from "./update-channels";
import showNotificationInjectable from "../show-notification/show-notification.injectable";

const versionUpdateInjectable = getInjectable({
  id: "version-update",

  instantiate: (di) => {
    const selectedUpdateChannel = di.inject(selectedUpdateChannelInjectable);
    const downloadPlatformUpdate = di.inject(downloadPlatformUpdateInjectable);
    const checkForPlatformUpdates = di.inject(checkForPlatformUpdatesInjectable);
    const showNotification = di.inject(showNotificationInjectable);

    const discoveredVersionState = observable.box<string>();
    const downloadingState = observable.box<boolean>(false);
    const checkingState = observable.box<boolean>(false);
    const discoveredFromUpdateChannelState = observable.box<UpdateChannel>();

    return {
      discoveredVersion: computed(() => discoveredVersionState.get()),
      discoveredFromUpdateChannel: computed(() => discoveredFromUpdateChannelState.get()),
      downloading: computed(() => downloadingState.get()),
      checking: computed(() => checkingState.get()),

      checkForUpdates: checkForUpdatesFor(
        checkForPlatformUpdates,
        discoveredVersionState,
        checkingState,
        selectedUpdateChannel.value,
        discoveredFromUpdateChannelState,
        showNotification,
      ),

      downloadUpdate: downloadUpdateFor(
        downloadPlatformUpdate,
        downloadingState,
      ),
    };
  },
});

export default versionUpdateInjectable;

const downloadUpdateFor =
  (
    downloadPlatformUpdate: () => Promise<void>,
    downloadingState: IObservableValue<boolean>,
  ) =>
    async () => {
      runInAction(() => {
        downloadingState.set(true);
      });

      await downloadPlatformUpdate();

      runInAction(() => {
        downloadingState.set(false);
      });
    };

const checkForUpdatesFor =
  (
    checkForPlatformUpdates: CheckForPlatformUpdates,
    discoveredVersionState: IObservableValue<string>,
    checkingState: IObservableValue<boolean>,
    selectedUpdateChannel: IComputedValue<UpdateChannel>,
    discoveredFromUpdateChannelState: IObservableValue<UpdateChannel>,
    showNotification: (message: string) => void,
  ) =>
    async () => {
      runInAction(() => {
        checkingState.set(true);
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
        discoveredFromUpdateChannelState.set(actualUpdateChannel);
        discoveredVersionState.set(version);
        checkingState.set(false);
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
