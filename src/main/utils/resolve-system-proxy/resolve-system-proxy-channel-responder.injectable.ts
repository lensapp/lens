/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { resolveSystemProxyChannel } from "../../../common/utils/resolve-system-proxy/resolve-system-proxy-channel";
import resolveSystemProxyInjectable from "./resolve-system-proxy.injectable";
import { getRequestChannelListenerInjectable } from "../../../common/utils/channel/request-channel-listener-injection-token";

const resolveSystemProxyChannelResponderInjectable = getRequestChannelListenerInjectable({
  channel: resolveSystemProxyChannel,
  handlerInjectable: resolveSystemProxyInjectable,
});

export default resolveSystemProxyChannelResponderInjectable;
