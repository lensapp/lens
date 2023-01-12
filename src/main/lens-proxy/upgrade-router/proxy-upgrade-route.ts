/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { SetRequired } from "type-fest";
import type { IncomingMessage } from "http";
import type { Cluster } from "../../../common/cluster/cluster";
import type { Socket } from "net";

export type LensProxyRequest = SetRequired<IncomingMessage, "url" | "method">;

export interface LensProxyUpgradeRequestArgs {
  req: LensProxyRequest;
  socket: Socket;
  head: Buffer;
  cluster: Cluster;
}
export type LensProxyUpgradeRequestHandler = (args: LensProxyUpgradeRequestArgs) => void | Promise<void>;

export interface LensProxyUpgradeRoute {
  path: string;
  handler: LensProxyUpgradeRequestHandler;
}

export const lensProxyUpgradeRouteInjectionToken = getInjectionToken<LensProxyUpgradeRoute>({
  id: "lens-proxy-upgrade-route-token",
});
