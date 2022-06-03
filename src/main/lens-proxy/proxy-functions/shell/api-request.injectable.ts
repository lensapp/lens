/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import openShellSessionInjectable from "../../../shell-session/open-shell-session.injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import type { ProxyApiRequest } from "../../lens-proxy";
import getClusterForRequestInjectable from "../../get-cluster-for-request.injectable";
import { Server } from "ws";
import authenticateRequestInjectable from "./authenticate-request.injectable";

const shellApiRequestInjectable = getInjectable({
  id: "shell-api-request",

  instantiate: (di): ProxyApiRequest => {
    const openShellSession = di.inject(openShellSessionInjectable);
    const authenticateRequest = di.inject(authenticateRequestInjectable);
    const logger = di.inject(loggerInjectable);
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);

    return ({ req, socket, head }) => {
      const cluster = getClusterForRequest(req);
      const { searchParams } = new URL(req.url, "https://127.0.0.1");
      const nodeName = searchParams.get("node") || undefined;
      const shellToken = searchParams.get("shellToken");
      const tabId = searchParams.get("id");

      if (!tabId || !cluster || !shellToken || !authenticateRequest(cluster.id, tabId, shellToken)) {
        socket.write("Invalid shell request");
        socket.end();
      } else {
        new Server({ noServer: true })
          .handleUpgrade(req, socket, head, (websocket) => {
            openShellSession({ websocket, cluster, tabId, nodeName })
              .catch(error => logger.error(`[SHELL-SESSION]: failed to open a ${nodeName ? "node" : "local"} shell`, error));
          });
      }
    };
  },
});

export default shellApiRequestInjectable;
