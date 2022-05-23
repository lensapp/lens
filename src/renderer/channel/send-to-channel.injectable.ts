/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sendToChannelInjectionToken } from "../../common/channel/send-to-channel-injection-token";
import sendToMainInjectable from "./send-to-main.injectable";

const sendToChannelInjectable = getInjectable({
  id: "send-to-channel",

  instantiate: (di) => {
    const sendToMain = di.inject(sendToMainInjectable);

    return (channel, message) => {
      sendToMain(channel.id, message);
    };
  },

  injectionToken: sendToChannelInjectionToken,
});

export default sendToChannelInjectable;
