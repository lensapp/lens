/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import resolveProxyChannelInjectable from "../common/resolve-proxy-channel.injectable";
import resolveProxyInjectable from "./resolve-proxy.injectable";
import { requestChannelListenerInjectionToken } from "../../../../common/utils/channel/request-channel-listener-injection-token";

const resolveProxyChannelResponderInjectable = getInjectable({
  id: "resolve-proxy-channel-responder",

  instantiate: (di) => ({
    channel: di.inject(resolveProxyChannelInjectable),
    handler: di.inject(resolveProxyInjectable),
  }),

  injectionToken: requestChannelListenerInjectionToken,
});

export default resolveProxyChannelResponderInjectable;
