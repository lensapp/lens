/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { lensWindowInjectionToken } from "../start-main-application/lens-window/application-window/lens-window-injection-token";
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { filter } from "lodash/fp";
import { sendToAgnosticChannelInjectionToken } from "../../common/sync-box/channel/send-to-agnostic-channel-injection-token";

const sendToAgnosticChannelInjectable = getInjectable({
  id: "send-to-agnostic-channel-main",

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

  injectionToken: sendToAgnosticChannelInjectionToken,
});

export default sendToAgnosticChannelInjectable;
