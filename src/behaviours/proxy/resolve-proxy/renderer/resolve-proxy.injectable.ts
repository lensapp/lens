/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { resolveProxyInjectionToken } from "../common/resolve-proxy-injection-token";
import requestFromChannelInjectable from "../../../../renderer/utils/channel/request-from-channel.injectable";
import resolveProxyChannelInjectable from "../common/resolve-proxy-channel.injectable";

const resolveProxyInjectable = getInjectable({
  id: "resolve-proxy-for-renderer",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectable);
    const resolveProxyChannel = di.inject(resolveProxyChannelInjectable);

    return async (url) => requestFromChannel(resolveProxyChannel, url);
  },

  injectionToken: resolveProxyInjectionToken,
});

export default resolveProxyInjectable;
