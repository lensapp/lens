/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action, computed, observable } from "mobx";
import type { UpdateChannelId } from "./update-channels";
import { updateChannels } from "./update-channels";

const selectedUpdateChannelInjectable = getInjectable({
  id: "selected-update-channel",

  instantiate: () => {
    const state = observable.box(updateChannels.latest);

    return {
      value: computed(() => state.get()),

      setValue: action((channelId: UpdateChannelId) => {
        state.set(updateChannels[channelId]);
      }),
    };
  },
});

export default selectedUpdateChannelInjectable;
