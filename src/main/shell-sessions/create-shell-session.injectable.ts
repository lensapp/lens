/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import type WebSocket from "ws";
import createLocalShellSessionInjectable from "./create-local-shell-session.injectable";
import type { ShellSession } from "./shell-session";
import type { Kubectl } from "../kubectl/kubectl";
import { bind } from "../../common/utils";
import createKubectlInjectable from "../kubectl/create-kubectl.injectable";
import createNodeShellSessionInjectable from "./create-node-shell-session.injectable";
import type { LocalShellSessionArgs } from "./local-shell-session";
import type { NodeShellSessionArgs } from "./node-shell-session";

export interface CreateShellSessionArgs {
  websocket: WebSocket;
  cluster: Cluster;
  tabId: string;
  nodeName?: string;
}

interface Dependencies {
  createLocalShellSession: (args: LocalShellSessionArgs) => ShellSession;
  createNodeShellSession: (args: NodeShellSessionArgs) => ShellSession;
  createKubectl: (version: string) => Kubectl;
}

function createShellSession({ createLocalShellSession, createNodeShellSession, createKubectl }: Dependencies, { nodeName, ...args }: CreateShellSessionArgs): ShellSession {
  const kubectl = createKubectl(args.cluster.version);

  if (nodeName) {
    return createNodeShellSession({ nodeName, kubectl, ...args });
  } else {
    return createLocalShellSession({ kubectl, ...args });
  }
}

const createShellSessionInjectable = getInjectable({
  instantiate: (di) => bind(createShellSession, null, {
    createKubectl: di.inject(createKubectlInjectable),
    createLocalShellSession: di.inject(createLocalShellSessionInjectable),
    createNodeShellSession: di.inject(createNodeShellSessionInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createShellSessionInjectable;
