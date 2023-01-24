/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { resolveSystemProxyInjectionToken } from "../../../common/utils/resolve-system-proxy/resolve-system-proxy-injection-token";
import requestFromChannelInjectable from "../channel/request-from-channel.injectable";
import { resolveSystemProxyChannel } from "../../../common/utils/resolve-system-proxy/resolve-system-proxy-channel";

const resolveSystemProxyInjectable = getInjectable({
  id: "resolve-system-proxy-for-renderer",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectable);

    return async (url) => requestFromChannel(resolveSystemProxyChannel, url);
  },

  injectionToken: resolveSystemProxyInjectionToken,
});

export default resolveSystemProxyInjectable;
