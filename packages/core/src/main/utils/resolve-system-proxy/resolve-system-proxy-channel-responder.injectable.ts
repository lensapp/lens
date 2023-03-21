/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { resolveSystemProxyChannel } from "../../../common/utils/resolve-system-proxy/resolve-system-proxy-channel";
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";
import resolveSystemProxyInjectable from "./resolve-system-proxy.injectable";

const resolveSystemProxyChannelResponderInjectable = getRequestChannelListenerInjectable({
  id: "resolve-system-proxy-channel-responder-listener",
  channel: resolveSystemProxyChannel,
  getHandler: (di) => di.inject(resolveSystemProxyInjectable),
});

export default resolveSystemProxyChannelResponderInjectable;
