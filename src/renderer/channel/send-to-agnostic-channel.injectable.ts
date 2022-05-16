/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sendToAgnosticChannelInjectionToken } from "../../common/channel/send-to-agnostic-channel-injection-token";
import sendToMainInjectable from "./send-to-main.injectable";

const sendToAgnosticChannelInjectable = getInjectable({
  id: "send-to-agnostic-channel-main",

  instantiate: (di) => {
    const sendToMain = di.inject(sendToMainInjectable);

    return (channel, message) => {
      sendToMain(channel.id, message);
    };
  },

  injectionToken: sendToAgnosticChannelInjectionToken,
});

export default sendToAgnosticChannelInjectable;
