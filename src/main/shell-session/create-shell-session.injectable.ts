/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import type WebSocket from "ws";
import localShellSessionInjectable from "./local-shell-session/local-shell-session.injectable";
import nodeShellSessionInjectable from "./node-shell-session/node-shell-session.injectable";

interface Args {
  webSocket: WebSocket;
  cluster: Cluster;
  tabId: string;
  nodeName?: string;
}

const createShellSessionInjectable = getInjectable({
  id: "create-shell-session",

  instantiate:
    (di) =>
      ({ nodeName, ...rest }: Args) =>
        !nodeName
          ? di.inject(localShellSessionInjectable, rest)
          : di.inject(nodeShellSessionInjectable, { nodeName, ...rest }),
});

export default createShellSessionInjectable;
