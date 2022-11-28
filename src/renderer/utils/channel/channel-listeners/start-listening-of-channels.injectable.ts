/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsInjectionToken } from "../../../before-frame-starts/before-frame-starts-injection-token";
import listeningOnMessageChannelsInjectable from "../../../../common/utils/channel/listening-on-message-channels.injectable";

const startListeningOfChannelsInjectable = getInjectable({
  id: "start-listening-of-channels-renderer",

  instantiate: (di) => {
    const listeningOfChannels = di.inject(listeningOnMessageChannelsInjectable);

    return {
      id: "start-listening-of-channels-renderer",
      run: async () => {
        await listeningOfChannels.start();
      },
    };
  },

  injectionToken: beforeFrameStartsInjectionToken,
});

export default startListeningOfChannelsInjectable;
