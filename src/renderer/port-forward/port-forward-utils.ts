/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ForwardedPort } from "./port-forward-item";

export function portForwardAddress(portForward: ForwardedPort) {
  return `${portForward.protocol ?? "http"}://localhost:${portForward.forwardPort}`;
}

export function predictProtocol(name: string | undefined) {
  return name === "https" ? "https" : "http";
}
