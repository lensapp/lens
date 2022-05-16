/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { timingSafeEqual } from "crypto";
import type { ClusterId } from "../../../../common/cluster-types";
import { getOrInsertMap } from "../../../../common/utils";
import randomBytesInjectable from "../../../utils/random-bytes.injectable";

export interface ShellRequestAuthenticator {
  authenticate(clusterId: ClusterId, tabId: string, token: string | undefined): boolean;
  getTokenFor(clusterId: ClusterId, tabId: string): Promise<Uint8Array>;
}

const shellRequestAuthenticatorInjectable = getInjectable({
  id: "shell-request-authenticator",

  instantiate: (di): ShellRequestAuthenticator => {
    const randomBytes = di.inject(randomBytesInjectable);
    const tokens = new Map<ClusterId, Map<string, Uint8Array>>();

    return {
      authenticate: (clusterId, tabId, token) => {
        const clusterTokens = tokens.get(clusterId);

        if (!clusterTokens || !tabId || !token) {
          return false;
        }

        const authToken = clusterTokens.get(tabId);
        const buf = Uint8Array.from(Buffer.from(token, "base64"));

        if (authToken instanceof Uint8Array && authToken.length === buf.length && timingSafeEqual(authToken, buf)) {
          // remove the token because it is a single use token
          clusterTokens.delete(tabId);

          return true;
        }

        return false;
      },
      getTokenFor: async (clusterId, tabId) => {
        const authToken = Uint8Array.from(await randomBytes(128));
        const forCluster = getOrInsertMap(tokens, clusterId);

        forCluster.set(tabId, authToken);

        return authToken;
      },
    };
  },
});

export default shellRequestAuthenticatorInjectable;
