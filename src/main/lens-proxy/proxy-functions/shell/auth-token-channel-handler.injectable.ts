/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import getShellAuthTokenChannelInjectable from "../../../../common/shell-authentication/get-auth-token-channel.injectable";
import { getRequestChannelHandlerInjectable } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import shellRequestAuthenticatorInjectable from "./request-authenticator.injectable";

const getShellAuthTokenChannelHandlerInjectable = getRequestChannelHandlerInjectable(
  getShellAuthTokenChannelInjectable,
  (di) => {
    const authenticator = di.inject(shellRequestAuthenticatorInjectable);

    return ({ clusterId, tabId }) => authenticator.getTokenFor(clusterId, tabId);
  },
);

export default getShellAuthTokenChannelHandlerInjectable;
