/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestChannel } from "../../../../common/utils/channel/request-channel-injection-token";
import { requestChannelInjectionToken } from "../../../../common/utils/channel/request-channel-injection-token";

export type ResolveProxyChannel = RequestChannel<string, string>;

const resolveProxyChannelInjectable = getInjectable({
  id: "resolve-proxy-channel",

  instantiate: (): ResolveProxyChannel => ({
    id: "resolve-proxy-channel",
  }),

  injectionToken: requestChannelInjectionToken,
});

export default resolveProxyChannelInjectable;
