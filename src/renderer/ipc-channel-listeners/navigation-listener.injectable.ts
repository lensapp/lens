/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ipcChannelListenerInjectionToken } from "./ipc-channel-listener-injection-token";
import { appNavigationIpcChannel, clusterFrameNavigationIpcChannel } from "../../common/front-end-routing/navigation-ipc-channel";
import currentlyInClusterFrameInjectable from "../routes/currently-in-cluster-frame.injectable";
import { navigateToUrlInjectionToken } from "../../common/front-end-routing/navigate-to-url-injection-token";
import focusWindowInjectable from "./focus-window.injectable";

const navigationListenerInjectable = getInjectable({
  id: "navigation-listener",

  instantiate: (di) => {
    const navigateToUrl = di.inject(navigateToUrlInjectionToken);
    const currentlyInClusterFrame = di.inject(currentlyInClusterFrameInjectable);
    const focusWindow = di.inject(focusWindowInjectable);

    return {
      channel: currentlyInClusterFrame
        ? clusterFrameNavigationIpcChannel
        : appNavigationIpcChannel,

      handle: (url: string) => {
        navigateToUrl(url);

        if (!currentlyInClusterFrame) {
          focusWindow(); // make sure that the main frame is focused
        }
      },
    };
  },

  injectionToken: ipcChannelListenerInjectionToken,
});

export default navigationListenerInjectable;
