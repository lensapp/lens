/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { messageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import sendToMainInjectable from "./send-to-main.injectable";
import type { MessageChannel } from "../../../common/utils/channel/message-channel-injection-token";

const messageToChannelInjectable = getInjectable({
  id: "message-to-channel",

  instantiate: (di) => {
    const sendToMain = di.inject(sendToMainInjectable);

    // TODO: Figure out way to improve typing in internals
    // Notice that this should be injected using "messageToChannelInjectionToken" which is typed correctly.
    return (channel: MessageChannel<any>, message?: unknown) => {
      sendToMain(channel.id, message);
    };
  },

  injectionToken: messageToChannelInjectionToken,
});

export default messageToChannelInjectable;
