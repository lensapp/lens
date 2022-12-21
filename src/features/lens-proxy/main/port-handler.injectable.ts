/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getRequestChannelListenerInjectable } from "../../../main/utils/channel/channel-listeners/listener-tokens";
import { lensProxyPortChannel } from "../common/port-channel";
import lensProxyPortInjectable from "../common/port.injectable";

const lensProxyPortListener = getRequestChannelListenerInjectable({
  channel: lensProxyPortChannel,
  handler: (di) => {
    const lensProxyPort = di.inject(lensProxyPortInjectable);

    return () => lensProxyPort.get();
  },
});

export default lensProxyPortListener;
