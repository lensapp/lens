/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { SendMessageToChannel } from "../../../common/utils/channel/message-to-channel-injection-token";
import { sendMessageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import sendToMainInjectable from "./send-to-main.injectable";

const messageToChannelInjectable = getInjectable({
  id: "message-to-channel",

  instantiate: (di) => {
    const sendToMain = di.inject(sendToMainInjectable);

    return ((channel, message) => {
      sendToMain(channel.id, message);
    }) as SendMessageToChannel;
  },

  injectionToken: sendMessageToChannelInjectionToken,
});

export default messageToChannelInjectable;
