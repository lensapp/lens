/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type net from "net";
import type { Cluster } from "../../../common/cluster/cluster";
import type { ProxyIncomingMessage } from "../messages";

export interface ProxyApiRequestArgs {
  req: ProxyIncomingMessage;
  socket: net.Socket;
  head: Buffer;
  cluster: Cluster;
}

export type LensProxyApiRequest = (args: ProxyApiRequestArgs) => void;
