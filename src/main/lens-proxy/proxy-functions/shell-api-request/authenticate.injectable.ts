/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../../common/cluster-types";
import shellRequestAuthTokensInjectable from "./shell-request-auth-tokens.injectable";
import crypto from "crypto";

export type AuthenticateShellRequest = (clusterId: ClusterId, tabId: string, token: string | null) => boolean;

const authenticateShellRequestInjectable = getInjectable({
  id: "authenticate-shell-request",
  instantiate: (di): AuthenticateShellRequest => {
    const shellRequestAuthTokens = di.inject(shellRequestAuthTokensInjectable);

    return (clusterId, tabId, token) => {
      const clusterTokens = shellRequestAuthTokens.get(clusterId);

      if (!clusterTokens || !tabId || !token) {
        return false;
      }

      const authToken = clusterTokens.get(tabId);
      const buf = Uint8Array.from(Buffer.from(token, "base64"));

      if (authToken instanceof Uint8Array && authToken.length === buf.length && crypto.timingSafeEqual(authToken, buf)) {
        // remove the token because it is a single use token
        clusterTokens.delete(tabId);

        return true;
      }

      return false;
    };
  },
});

export default authenticateShellRequestInjectable;
