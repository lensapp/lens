/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../common/cluster-types";
import { ipcMainHandle } from "../../../common/ipc";
import { getOrInsertMap } from "../../../common/utils";
import randomBytesInjectable from "../../../common/utils/random-bytes.injectable";
import crypto from "crypto";

export type AuthenticateShellRequest = (clusterId: ClusterId, tabId: string, token: string | undefined) => boolean;

const authenticateShellRequestInjectable = getInjectable({
  id: "authenticate-shell-request",

  instantiate: (di): AuthenticateShellRequest => {
    const randomBytes = di.inject(randomBytesInjectable);
    const tokens = new Map<ClusterId, Map<string, Uint8Array>>();

    ipcMainHandle("cluster:shell-api", async (event, clusterId, tabId) => {
      const authToken = Uint8Array.from(await randomBytes(128));
      const forCluster = getOrInsertMap(tokens, clusterId);

      forCluster.set(tabId, authToken);

      return authToken;
    });

    return (clusterId, tabId, token) => {
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
    };
  },
});

export default authenticateShellRequestInjectable;
