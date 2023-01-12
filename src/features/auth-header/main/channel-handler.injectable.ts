/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getRequestChannelListenerInjectable } from "../../../main/utils/channel/channel-listeners/listener-tokens";
import { authHeaderChannel } from "../common/channel";
import authHeaderStateInjectable from "../common/header-state.injectable";

const authHeaderRequestListenerInjectable = getRequestChannelListenerInjectable({
  channel: authHeaderChannel,
  handler: (di) => {
    const authHeaderState = di.inject(authHeaderStateInjectable);

    return () => authHeaderState.get();
  },
});

export default authHeaderRequestListenerInjectable;
