/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import resolveSystemProxyChannelInjectable from "../../../common/utils/resolve-system-proxy/resolve-system-proxy-channel.injectable";
import resolveSystemProxyInjectable from "./resolve-system-proxy.injectable";
import { requestChannelListenerInjectionToken } from "../../../common/utils/channel/request-channel-listener-injection-token";

const resolveSystemProxyChannelResponderInjectable = getInjectable({
  id: "resolve-system-proxy-channel-responder",

  instantiate: (di) => ({
    channel: di.inject(resolveSystemProxyChannelInjectable),
    handler: di.inject(resolveSystemProxyInjectable),
  }),

  injectionToken: requestChannelListenerInjectionToken,
});

export default resolveSystemProxyChannelResponderInjectable;
