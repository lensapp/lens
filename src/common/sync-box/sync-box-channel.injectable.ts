/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { channelInjectionToken } from "../channel/channel-injection-token";

const syncBoxChannelInjectable = getInjectable({
  id: "sync-box-channel",

  instantiate: () => ({
    id: "sync-box-channel",
  }),

  injectionToken: channelInjectionToken,
});

export default syncBoxChannelInjectable;
