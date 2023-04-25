/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { autorun } from "mobx";
import { getStartableStoppable } from "@k8slens/startable-stoppable";
import setUpdateOnQuitInjectable from "../../../../main/electron-app/features/set-update-on-quit.injectable";
import selectedUpdateChannelInjectable from "../../common/selected-update-channel.injectable";
import type { ReleaseChannel, UpdateChannel } from "../../common/update-channels";
import discoveredUpdateVersionInjectable from "../../common/discovered-update-version.injectable";

const watchIfUpdateShouldHappenOnQuitInjectable = getInjectable({
  id: "watch-if-update-should-happen-on-quit",

  instantiate: (di) => {
    const setUpdateOnQuit = di.inject(setUpdateOnQuitInjectable);
    const selectedUpdateChannel = di.inject(selectedUpdateChannelInjectable);
    const discoveredVersionState = di.inject(discoveredUpdateVersionInjectable);

    return getStartableStoppable("watch-if-update-should-happen-on-quit", () =>
      autorun(() => {
        const sufficientlyStableUpdateChannels = getSufficientlyStableUpdateChannels(selectedUpdateChannel.value.get());
        const updateIsDiscoveredFromChannel = discoveredVersionState.value.get()?.updateChannel;

        setUpdateOnQuit((
          updateIsDiscoveredFromChannel
            ? sufficientlyStableUpdateChannels.includes(updateIsDiscoveredFromChannel.id)
            : false
        ));
      }),
    );
  },
});

const getSufficientlyStableUpdateChannels = (updateChannel: UpdateChannel): ReleaseChannel[] => {
  if (!updateChannel.moreStableUpdateChannel) {
    return [updateChannel.id];
  }

  return [
    updateChannel.id,
    ...getSufficientlyStableUpdateChannels(updateChannel.moreStableUpdateChannel),
  ];
};

export default watchIfUpdateShouldHappenOnQuitInjectable;
