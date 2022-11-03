/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "../../../common/utils/channel/message-channel-listener-injection-token";
import getVisibleWindowsInjectable from "../../../main/start-main-application/lens-window/get-visible-windows.injectable";
import topBarStateInjectable from "../../top-bar/common/state.injectable";
import { windowLocationChangedChannel } from "../common/channel";

const windowLocationHasChangedForTopBarStateHandlerInjectable = getMessageChannelListenerInjectable({
  id: "for-top-bar-state",
  channel: windowLocationChangedChannel,
  handler: (di) => {
    const getVisibleWindows = di.inject(getVisibleWindowsInjectable);
    const topBarState = di.inject(topBarStateInjectable);

    return () => {
      const windows = getVisibleWindows();

      topBarState.set({
        prevEnabled: windows.some(window => window.canGoBack()),
        nextEnabled: windows.some(window => window.canGoForward()),
      });
    };
  },
});

export default windowLocationHasChangedForTopBarStateHandlerInjectable;
