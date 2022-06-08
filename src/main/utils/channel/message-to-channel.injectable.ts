/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { messageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import getVisibleWindowsInjectable from "../../start-main-application/lens-window/get-visible-windows.injectable";
import type { MessageToChannel } from "../../../common/utils/channel/message-to-channel-injection-token";

const messageToChannelInjectable = getInjectable({
  id: "message-to-channel",

  instantiate: (di) => {
    const getVisibleWindows = di.inject(getVisibleWindowsInjectable);

    return ((channel, message) => {
      for (const window of getVisibleWindows()) {
        window.send({
          channel: channel.id,
          data: message,
        });
      }
    }) as MessageToChannel;
  },

  injectionToken: messageToChannelInjectionToken,
});

export default messageToChannelInjectable;
