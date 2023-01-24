/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { resolveSystemProxyChannel } from "../../../common/utils/resolve-system-proxy/resolve-system-proxy-channel";
import { getRequestChannelListenerInjectable } from "../channel/channel-listeners/listener-tokens";
import resolveSystemProxyInjectable from "./resolve-system-proxy.injectable";

const resolveSystemProxyChannelResponderInjectable = getRequestChannelListenerInjectable({
  channel: resolveSystemProxyChannel,
  handler: (di) => di.inject(resolveSystemProxyInjectable),
});

export default resolveSystemProxyChannelResponderInjectable;
