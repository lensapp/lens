/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getRequestChannelListenerInjectable } from "../../../main/utils/channel/channel-listeners/listener-tokens";
import { shellApiAuthChannel } from "../common/shell-api-auth-channel";
import shellApiAuthenticatorInjectable from "./shell-api-authenticator.injectable";

const shellApiAuthRequestChannelListener = getRequestChannelListenerInjectable({
  channel: shellApiAuthChannel,
  handler: (di) => {
    const shellApiAuthenticator = di.inject(shellApiAuthenticatorInjectable);

    return ({ clusterId, tabId }) => shellApiAuthenticator.requestToken(clusterId, tabId);
  },
});

export default shellApiAuthRequestChannelListener;
