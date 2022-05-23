/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { lensWindowInjectionToken } from "../start-main-application/lens-window/application-window/lens-window-injection-token";
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { filter } from "lodash/fp";
import { sendToChannelInjectionToken } from "../../common/channel/send-to-channel-injection-token";

const sendToChannelInjectable = getInjectable({
  id: "send-to-channel",

  instantiate: (di) => {
    const getAllLensWindows = () => di.injectMany(lensWindowInjectionToken);

    return (channel, message) => {
      const visibleWindows = pipeline(
        getAllLensWindows(),
        filter((lensWindow) => !!lensWindow.visible),
      );

      visibleWindows.forEach((lensWindow) =>
        lensWindow.send({ channel: channel.id, data: [message] }),
      );
    };
  },

  injectionToken: sendToChannelInjectionToken,
});

export default sendToChannelInjectable;
