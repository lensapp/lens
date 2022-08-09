/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import type WebSocket from "ws";
import openLocalShellSessionInjectable from "./local-shell-session/open.injectable";
import openNodeShellSessionInjectable from "./node-shell-session/open.injectable";

export interface OpenShellSessionArgs {
  websocket: WebSocket;
  cluster: Cluster;
  tabId: string;
  nodeName?: string;
}

export type OpenShellSession = (args: OpenShellSessionArgs) => Promise<void>;

const openShellSessionInjectable = getInjectable({
  id: "open-shell-session",

  instantiate: (di): OpenShellSession => {
    const openLocalShellSession = di.inject(openLocalShellSessionInjectable);
    const openNodeShellSession = di.inject(openNodeShellSessionInjectable);

    return ({ nodeName, ...args }) => (
      nodeName
        ? openNodeShellSession({ nodeName, ...args })
        : openLocalShellSession(args)
    );
  },
});

export default openShellSessionInjectable;
