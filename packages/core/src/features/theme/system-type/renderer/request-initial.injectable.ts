/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestChannelHandler } from "@k8slens/messaging";
import { requestFromChannelInjectionToken } from "@k8slens/messaging";
import { initialSystemThemeTypeChannel } from "../common/channels";

export type RequestInitialSystemThemeType = RequestChannelHandler<typeof initialSystemThemeTypeChannel>;

const requestInitialSystemThemeTypeInjectable = getInjectable({
  id: "request-initial-system-theme-type",
  instantiate: (di): RequestInitialSystemThemeType => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);

    return () => requestFromChannel(initialSystemThemeTypeChannel);
  },
});

export default requestInitialSystemThemeTypeInjectable;
