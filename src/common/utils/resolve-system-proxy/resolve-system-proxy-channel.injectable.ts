/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestChannel } from "../channel/request-channel-injection-token";
import { requestChannelInjectionToken } from "../channel/request-channel-injection-token";

export type ResolveSystemProxyChannel = RequestChannel<string, string>;

const resolveSystemProxyChannelInjectable = getInjectable({
  id: "resolve-system-proxy-channel",

  instantiate: (): ResolveSystemProxyChannel => ({
    id: "resolve-system-proxy-channel",
  }),

  injectionToken: requestChannelInjectionToken,
});

export default resolveSystemProxyChannelInjectable;
