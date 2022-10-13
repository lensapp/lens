/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../common/cluster-types";
import { getOrInsertMap, put } from "../../../common/utils";
import type { TabId } from "../../../renderer/components/dock/dock/store";
import crypto from "crypto";
import { promisify } from "util";

const randomBytes = promisify(crypto.randomBytes);

export interface ShellApiAuthenticator {
  authenticate: (clusterId: ClusterId, tabId: string, token: string | null) => boolean;
  requestToken: (clusterId: ClusterId, tabId: TabId) => Promise<Uint8Array>;
}

const shellApiAuthenticatorInjectable = getInjectable({
  id: "shell-api-authenticator",
  instantiate: (): ShellApiAuthenticator => {
    const tokens = new Map<ClusterId, Map<TabId, Uint8Array>>();

    return {
      authenticate: (clusterId, tabId, token) => {
        const clusterTokens = tokens.get(clusterId);

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
      },
      requestToken: async (clusterId, tabId) => (
        put(
          getOrInsertMap(tokens, clusterId),
          tabId,
          Uint8Array.from(await randomBytes(128)),
        )
      ),
    };
  },
});

export default shellApiAuthenticatorInjectable;
