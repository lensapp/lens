/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "../../../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import listeningOnMessageChannelsInjectable from "../../../../common/utils/channel/listening-on-message-channels.injectable";
import listeningOnRequestChannelsInjectable from "./listening-on-request-channels.injectable";

const startListeningOnChannelsInjectable = getInjectable({
  id: "start-listening-on-channels-main",

  instantiate: (di) => {
    const listeningOnMessageChannels = di.inject(listeningOnMessageChannelsInjectable);
    const listeningOnRequestChannels = di.inject(listeningOnRequestChannelsInjectable);

    return {
      id: "start-listening-on-channels-main",
      run: () => {
        listeningOnMessageChannels.start();
        listeningOnRequestChannels.start();
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startListeningOnChannelsInjectable;
