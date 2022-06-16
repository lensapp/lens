/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageToChannel } from "../../../common/utils/channel/message-to-channel-injection-token";
import { messageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import { tentativeStringifyJson } from "../../../common/utils/tentative-stringify-json";
import getVisibleWindowsInjectable from "../../start-main-application/lens-window/get-visible-windows.injectable";

const messageToChannelInjectable = getInjectable({
  id: "message-to-channel",

  instantiate: (di) => {
    const getVisibleWindows = di.inject(getVisibleWindowsInjectable);

    return ((channel, message) => {
      const stringifiedMessage = tentativeStringifyJson(message);

      getVisibleWindows().forEach((lensWindow) =>
        lensWindow.send({ channel: channel.id, data: stringifiedMessage ? [stringifiedMessage] : [] }),
      );
    }) as MessageToChannel;
  },

  injectionToken: messageToChannelInjectionToken,
});

export default messageToChannelInjectable;
