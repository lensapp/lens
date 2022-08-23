/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { messageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import type { MessageChannel } from "../../../common/utils/channel/message-channel-injection-token";
import { tentativeStringifyJson } from "../../../common/utils/tentative-stringify-json";
import getVisibleWindowsInjectable from "../../start-main-application/lens-window/get-visible-windows.injectable";

const messageToChannelInjectable = getInjectable({
  id: "message-to-channel",

  instantiate: (di) => {
    const getVisibleWindows = di.inject(getVisibleWindowsInjectable);

    // TODO: Figure out way to improve typing in internals
    // Notice that this should be injected using "messageToChannelInjectionToken" which is typed correctly.
    return (channel: MessageChannel<any>, message?: unknown) => {
      const stringifiedMessage = tentativeStringifyJson(message);

      getVisibleWindows().forEach((lensWindow) =>
        lensWindow.send({ channel: channel.id, data: stringifiedMessage ? [stringifiedMessage] : [] }),
      );
    };
  },

  injectionToken: messageToChannelInjectionToken,
});

export default messageToChannelInjectable;
