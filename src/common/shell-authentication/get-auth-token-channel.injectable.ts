/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../cluster-types";
import type { RequestChannel } from "../utils/channel/request-channel-injection-token";
import { requestChannelInjectionToken } from "../utils/channel/request-channel-injection-token";

export type GetShellAuthTokenChannel = RequestChannel<
  {
    clusterId: ClusterId;
    tabId: string;
  },
  Uint8Array
>;

const getShellAuthTokenChannelInjectable = getInjectable({
  id: "get-shell-auth-token-channel",
  instantiate: (): GetShellAuthTokenChannel => ({
    id: "get-shell-auth-token-channel",
  }),
  injectionToken: requestChannelInjectionToken,
});

export default getShellAuthTokenChannelInjectable;
