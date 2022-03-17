/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type http from "http";
import type net from "net";
import type { SetRequired } from "type-fest";
import type { Cluster } from "../../common/cluster/cluster";

export interface ProxyApiRequestArgs {
  req: SetRequired<http.IncomingMessage, "url" | "method">;
  socket: net.Socket;
  head: Buffer;
  cluster: Cluster;
}
