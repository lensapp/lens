/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { autorun } from "mobx";
import { getStartableStoppable } from "../../../common/utils/get-startable-stoppable";
import setUpdateOnQuitInjectable from "../../electron-app/features/set-update-on-quit.injectable";
import selectedUpdateChannelInjectable from "../../../common/application-update/selected-update-channel/selected-update-channel.injectable";
import type { UpdateChannel } from "../../../common/application-update/update-channels";
import discoveredUpdateVersionInjectable from "../../../common/application-update/discovered-update-version/discovered-update-version.injectable";

const watchIfUpdateShouldHappenOnQuitInjectable = getInjectable({
  id: "watch-if-update-should-happen-on-quit",

  instantiate: (di) => {
    const setUpdateOnQuit = di.inject(setUpdateOnQuitInjectable);
    const selectedUpdateChannel = di.inject(selectedUpdateChannelInjectable);
    const discoveredVersionState = di.inject(discoveredUpdateVersionInjectable);

    return getStartableStoppable("watch-if-update-should-happen-on-quit", () =>
      autorun(() => {
        const sufficientlyStableUpdateChannels =
          getSufficientlyStableUpdateChannels(selectedUpdateChannel.value.get());

        const discoveredVersion = discoveredVersionState.value.get();

        const updateIsDiscoveredFromChannel = discoveredVersion?.updateChannel;

        const updateOnQuit = updateIsDiscoveredFromChannel
          ? sufficientlyStableUpdateChannels.includes(
            updateIsDiscoveredFromChannel,
          )
          : false;

        setUpdateOnQuit(updateOnQuit);
      }),
    );
  },
});

const getSufficientlyStableUpdateChannels = (updateChannel: UpdateChannel): UpdateChannel[] => {
  if (!updateChannel.moreStableUpdateChannel) {
    return [updateChannel];
  }

  return [
    updateChannel,

    ...getSufficientlyStableUpdateChannels(updateChannel.moreStableUpdateChannel),
  ];
};

export default watchIfUpdateShouldHappenOnQuitInjectable;
