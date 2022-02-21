/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type http from "http";
import type net from "net";
import type { Cluster } from "../../common/cluster/cluster";

export interface ProxyApiRequestArgs {
  req: http.IncomingMessage;
  socket: net.Socket;
  head: Buffer;
  cluster: Cluster;
}
