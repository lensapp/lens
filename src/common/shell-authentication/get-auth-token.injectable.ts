/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ChannelRequest } from "../utils/channel/request-channel-injection-token";
import { requestFromChannelInjectionToken } from "../utils/channel/request-from-channel-injection-token";
import type { GetShellAuthTokenChannel } from "./get-auth-token-channel.injectable";
import getShellAuthTokenChannelInjectable from "./get-auth-token-channel.injectable";

export type GetShellAuthToken = ChannelRequest<GetShellAuthTokenChannel>;

const getShellAuthTokenInjectable = getInjectable({
  id: "get-shell-auth-token",
  instantiate: (di): GetShellAuthToken => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);
    const getShellAuthTokenChannel = di.inject(getShellAuthTokenChannelInjectable);

    return (arg) => requestFromChannel(getShellAuthTokenChannel, arg);
  },
});

export default getShellAuthTokenInjectable;
