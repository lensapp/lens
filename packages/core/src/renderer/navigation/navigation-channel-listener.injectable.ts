/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { InjectionToken } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import currentlyInClusterFrameInjectable from "../routes/currently-in-cluster-frame.injectable";
import { appNavigationChannel } from "../../common/front-end-routing/app-navigation-channel";
import { clusterFrameNavigationChannel } from "../../common/front-end-routing/cluster-frame-navigation-channel";
import focusWindowInjectable from "./focus-window.injectable";
import { navigateToUrlInjectionToken } from "../../common/front-end-routing/navigate-to-url-injection-token";
import type { MessageChannel, MessageChannelListener } from "../../common/utils/channel/message-channel-listener-injection-token";
import { messageChannelListenerInjectionToken } from "../../common/utils/channel/message-channel-listener-injection-token";

const navigationChannelListenerInjectable = getInjectable({
  id: "navigation-channel-listener",

  instantiate: (di) => {
    const currentlyInClusterFrame = di.inject(currentlyInClusterFrameInjectable);
    const focusWindow = di.inject(focusWindowInjectable);
    const navigateToUrl = di.inject(navigateToUrlInjectionToken);

    return {
      channel: currentlyInClusterFrame
        ? clusterFrameNavigationChannel
        : appNavigationChannel,

      handler: (url: string) => {
        navigateToUrl(url);

        if (!currentlyInClusterFrame) {
          focusWindow(); // make sure that the main frame is focused
        }
      },
    };
  },
  injectionToken: messageChannelListenerInjectionToken as InjectionToken<MessageChannelListener<MessageChannel<string>>, void>,
});

export default navigationChannelListenerInjectable;
