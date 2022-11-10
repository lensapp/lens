/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { promisify } from "util";
import { clusterShellAuthenticationChannel } from "../../../../common/terminal/channels";
import { getRequestChannelListenerInjectable } from "../../../utils/channel/channel-listeners/listener-tokens";
import shellRequestAuthTokensInjectable from "./shell-request-auth-tokens.injectable";
import crypto from "crypto";
import { getOrInsertMap, put } from "../../../../common/utils";

const randomBytes = promisify(crypto.randomBytes);

const clusterShellAuthenticationRequestHandlerInjectable = getRequestChannelListenerInjectable({
  channel: clusterShellAuthenticationChannel,
  handler: (di) => {
    const shellRequestAuthTokens = di.inject(shellRequestAuthTokensInjectable);

    return async ({ clusterId, tabId }) => {
      const authToken = Uint8Array.from(await randomBytes(128));
      const forCluster = getOrInsertMap(shellRequestAuthTokens, clusterId);

      return put(forCluster, tabId, authToken);
    };
  },
});

export default clusterShellAuthenticationRequestHandlerInjectable;
