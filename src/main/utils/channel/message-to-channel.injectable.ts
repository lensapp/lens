/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { lensWindowInjectionToken } from "../../start-main-application/lens-window/application-window/lens-window-injection-token";
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { filter } from "lodash/fp";
import { messageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import type { MessageChannel } from "../../../common/utils/channel/message-channel-injection-token";
import { tentativeStringifyJson } from "../../../common/utils/tentative-stringify-json";

const messageToChannelInjectable = getInjectable({
  id: "message-to-channel",

  instantiate: (di) => {
    const getAllLensWindows = () => di.injectMany(lensWindowInjectionToken);

    // TODO: Figure out way to improve typing in internals
    // Notice that this should be injected using "messageToChannelInjectionToken" which is typed correctly.
    return (channel: MessageChannel<any>, message?: unknown) => {
      const stringifiedMessage = tentativeStringifyJson(message);


      const visibleWindows = pipeline(
        getAllLensWindows(),
        filter((lensWindow) => !!lensWindow.visible),
      );

      visibleWindows.forEach((lensWindow) =>
        lensWindow.send({ channel: channel.id, data: stringifiedMessage ? [stringifiedMessage] : [] }),
      );
    };
  },

  injectionToken: messageToChannelInjectionToken,
});

export default messageToChannelInjectable;
