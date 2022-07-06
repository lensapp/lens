/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import type WebSocket from "ws";
import type { NodeShellSessionDependencies } from "./node-shell-session";
import { NodeShellSession } from "./node-shell-session";
import type { Kubectl } from "../../kubectl/kubectl";
import loggerInjectable from "../../../common/logger.injectable";
import ensureShellProcessInjectable from "../ensure-shell-process.injectable";
import getCachedShellEnvInjectable from "../get-cached-shell-env.injectable";
import getValidCwdInjectable from "../get-valid-cwd.injectable";

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

  instantiate: (di): OpenNodeShellSession => {
    const dependencies: NodeShellSessionDependencies = {
      ensureShellProcess: di.inject(ensureShellProcessInjectable),
      getCachedShellEnv: di.inject(getCachedShellEnvInjectable),
      getValidCwd: di.inject(getValidCwdInjectable),
      logger: di.inject(loggerInjectable),
    };

    return (args) => new NodeShellSession(dependencies, args).open();
  },
  causesSideEffects: true,
});

export default openNodeShellSessionInjectable;
