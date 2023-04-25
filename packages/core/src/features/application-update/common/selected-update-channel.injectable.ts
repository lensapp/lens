/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { action, computed, observable } from "mobx";
import type { UpdateChannel, ReleaseChannel } from "./update-channels";
import { updateChannels } from "./update-channels";
import defaultUpdateChannelInjectable from "./default-update-channel.injectable";

export interface SelectedUpdateChannel {
  value: IComputedValue<UpdateChannel>;
  setValue: (channelId?: ReleaseChannel) => void;
}

const selectedUpdateChannelInjectable = getInjectable({
  id: "selected-update-channel",

  instantiate: (di): SelectedUpdateChannel => {
    const defaultUpdateChannel = di.inject(defaultUpdateChannelInjectable);
    const state = observable.box<UpdateChannel>(undefined, { deep: false });

    return {
      value: computed(() => state.get() ?? defaultUpdateChannel),

      setValue: action((channelId) => {
        const targetUpdateChannel =
          channelId && updateChannels[channelId]
            ? updateChannels[channelId]
            : defaultUpdateChannel;

        state.set(targetUpdateChannel);
      }),
    };
  },
});

export default selectedUpdateChannelInjectable;
