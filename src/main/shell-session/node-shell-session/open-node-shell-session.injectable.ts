/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import type WebSocket from "ws";
import { NodeShellSession } from "./node-shell-session";
import type { Kubectl } from "../../kubectl/kubectl";

export interface OpenNodeShellSessionArgs {
  websocket: WebSocket;
  cluster: Cluster;
  tabId: string;
  nodeName: string;
  kubectl: Kubectl;
}

export type OpenNodeShellSession = (args: OpenNodeShellSessionArgs) => Promise<void>;

const openNodeShellSessionInjectable = getInjectable({
  id: "node-shell-session",

  instantiate: (): OpenNodeShellSession => (args) => new NodeShellSession(args).open(),
});

export default openNodeShellSessionInjectable;
