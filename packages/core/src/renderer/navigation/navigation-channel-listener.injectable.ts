/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import currentlyInClusterFrameInjectable from "../routes/currently-in-cluster-frame.injectable";
import { appNavigationChannel } from "../../common/front-end-routing/app-navigation-channel";
import { clusterFrameNavigationChannel } from "../../common/front-end-routing/cluster-frame-navigation-channel";
import focusWindowInjectable from "./focus-window.injectable";
import { navigateToUrlInjectionToken } from "../../common/front-end-routing/navigate-to-url-injection-token";
import type { MessageChannel, MessageChannelListener } from "@k8slens/messaging";
import { messageChannelListenerInjectionToken } from "@k8slens/messaging";

const navigationChannelListenerInjectable = getInjectable({
  id: "navigation-channel-listener",

  instantiate: (di): MessageChannelListener<MessageChannel<string>> => {
    const currentlyInClusterFrame = di.inject(currentlyInClusterFrameInjectable);
    const focusWindow = di.inject(focusWindowInjectable);
    const navigateToUrl = di.inject(navigateToUrlInjectionToken);

    return {
      id: "navigation-channel-listener",
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

  injectionToken: messageChannelListenerInjectionToken,
});

export default navigationChannelListenerInjectable;
