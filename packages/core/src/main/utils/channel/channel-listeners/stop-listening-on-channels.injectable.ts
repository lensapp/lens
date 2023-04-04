/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import listeningOnMessageChannelsInjectable from "../../../../common/utils/channel/listening-on-message-channels.injectable";
import listeningOnRequestChannelsInjectable from "./listening-on-request-channels.injectable";
import {
  beforeQuitOfBackEndInjectionToken
} from "../../../start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";

const stopListeningOnChannelsInjectable = getInjectable({
  id: "stop-listening-on-channels-main",

  instantiate: (di) => {
    const listeningOnMessageChannels = di.inject(listeningOnMessageChannelsInjectable);
    const listeningOnRequestChannels = di.inject(listeningOnRequestChannelsInjectable);

    return {
      id: "stop-listening-on-channels-main",
      run: () => {
        listeningOnMessageChannels.stop();
        listeningOnRequestChannels.stop();
      },
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopListeningOnChannelsInjectable;
