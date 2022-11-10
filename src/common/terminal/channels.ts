/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { TabId } from "../../renderer/components/dock/dock/store";
import type { ClusterId } from "../cluster-types";
import type { RequestChannel } from "../utils/channel/request-channel-listener-injection-token";


export enum TerminalChannels {
  STDIN = "stdin",
  STDOUT = "stdout",
  CONNECTED = "connected",
  RESIZE = "resize",
  PING = "ping",
}

export type TerminalMessage = {
  type: TerminalChannels.STDIN;
  data: string;
} | {
  type: TerminalChannels.STDOUT;
  data: string;
} | {
  type: TerminalChannels.CONNECTED;
} | {
  type: TerminalChannels.RESIZE;
  data: {
    width: number;
    height: number;
  };
} | {
  type: TerminalChannels.PING;
};

export interface ClusterShellAuthenticationArgs {
  clusterId: ClusterId;
  tabId: TabId;
}

export const clusterShellAuthenticationChannel: RequestChannel<ClusterShellAuthenticationArgs, Uint8Array> = {
  id: "cluster-shell-authentication-request",
};
