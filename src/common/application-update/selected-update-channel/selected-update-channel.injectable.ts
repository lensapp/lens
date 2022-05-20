/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { action, computed, observable } from "mobx";
import type { UpdateChannel, UpdateChannelId } from "../update-channels";
import { updateChannels } from "../update-channels";

export interface SelectedUpdateChannel {
  value: IComputedValue<UpdateChannel>;
  setValue: (channelId?: UpdateChannelId) => void;
}

// export const defaultUpdateChannel = new SemVer(getAppVersion()).prerelease[0]?.toString() || "latest";

// const updateChannel: PreferenceDescription<string> = {
//   fromStore(val) {
//     return !val || !updateChannels.has(val)
//       ? defaultUpdateChannel
//       : val;
//   },
//   toStore(val) {
//     if (!updateChannels.has(val) || val === defaultUpdateChannel) {
//       return undefined;
//     }
//
//     return val;
//   },
// };

const selectedUpdateChannelInjectable = getInjectable({
  id: "selected-update-channel",

  instantiate: (): SelectedUpdateChannel => {
    const state = observable.box(updateChannels.latest);

    return {
      value: computed(() => state.get()),

      setValue: action((channelId) => {
        const targetUpdateChannel = channelId ? updateChannels[channelId] : updateChannels.latest;

        state.set(targetUpdateChannel);
      }),
    };
  },
});

export default selectedUpdateChannelInjectable;
