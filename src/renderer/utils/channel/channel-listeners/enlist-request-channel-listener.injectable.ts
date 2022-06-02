/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { enlistRequestChannelListenerInjectionToken } from "../../../../common/utils/channel/enlist-request-channel-listener-injection-token";

const enlistRequestChannelListenerInjectable = getInjectable({
  id: "enlist-request-channel-listener-for-renderer",

  instantiate: () => {
    // Requests from main to renderer are not implemented yet.
    return () => () => {};
  },

  injectionToken: enlistRequestChannelListenerInjectionToken,
});

export default enlistRequestChannelListenerInjectable;
