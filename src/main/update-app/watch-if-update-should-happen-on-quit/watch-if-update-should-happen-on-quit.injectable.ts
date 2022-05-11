/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { autorun } from "mobx";
import { getStartableStoppable } from "../../../common/utils/get-startable-stoppable";
import setUpdateOnQuitInjectable from "../../electron-app/features/set-update-on-quit.injectable";
import versionUpdateInjectable from "../version-update.injectable";
import selectedUpdateChannelInjectable from "../selected-update-channel.injectable";
import type { UpdateChannel } from "../update-channels";

const watchIfUpdateShouldHappenOnQuitInjectable = getInjectable({
  id: "watch-if-update-should-happen-on-quit",

  instantiate: (di) => {
    const setUpdateOnQuit = di.inject(setUpdateOnQuitInjectable);
    const versionUpdate = di.inject(versionUpdateInjectable);
    const selectedUpdateChannel = di.inject(selectedUpdateChannelInjectable);

    return getStartableStoppable("watch-if-update-should-happen-on-quit", () =>
      autorun(() => {
        const sufficientlyStableUpdateChannels =
          getSufficientlyStableUpdateChannels(selectedUpdateChannel.value.get());

        const updateIsDiscoveredFromChannel = versionUpdate.discoveredFromUpdateChannel.get();

        const updateOnQuit = sufficientlyStableUpdateChannels.includes(updateIsDiscoveredFromChannel);

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
