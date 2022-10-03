/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "../../../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import listeningOfChannelsInjectable from "../../../../common/utils/channel/listening-of-channels.injectable";

const startListeningOfChannelsInjectable = getInjectable({
  id: "start-listening-of-channels-main",

  instantiate: (di) => {
    const listeningOfChannels = di.inject(listeningOfChannelsInjectable);

    return {
      id: "start-listening-of-channels-main",
      run: async () => {
        await listeningOfChannels.start();
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startListeningOfChannelsInjectable;
