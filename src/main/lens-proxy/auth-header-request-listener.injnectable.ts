/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { lensAuthenticationChannel } from "../../common/auth/channel";
import { getRequestChannelListenerInjectable } from "../utils/channel/channel-listeners/listener-tokens";
import authHeaderValueInjectable from "./auth-header-value.injectable";

const lensAuthenticationRequestListener = getRequestChannelListenerInjectable({
  channel: lensAuthenticationChannel,
  handler: (di) => {
    const authHeaderValue = di.inject(authHeaderValueInjectable);

    return () => authHeaderValue;
  },
});

export default lensAuthenticationRequestListener;
