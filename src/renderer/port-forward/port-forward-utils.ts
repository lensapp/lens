/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import { openBrowser } from "../utils";
import { Notifications } from "../components/notifications";
import type { ForwardedPort } from "./port-forward-item";
import logger from "../../common/logger";

export function portForwardAddress(portForward: ForwardedPort) {
  return `${portForward.protocol ?? "http"}://localhost:${portForward.forwardPort}`;
}

export function openPortForward(portForward: ForwardedPort) {
  const browseTo = portForwardAddress(portForward);

  openBrowser(browseTo)
    .catch(error => {
      logger.error(`failed to open in browser: ${error}`, {
        port: portForward.port,
        kind: portForward.kind,
        namespace: portForward.namespace,
        name: portForward.name,
      });
      Notifications.error(`Failed to open ${browseTo} in browser`);
    },
    );

}

export function predictProtocol(name: string | undefined) {
  return name === "https" ? "https" : "http";
}

