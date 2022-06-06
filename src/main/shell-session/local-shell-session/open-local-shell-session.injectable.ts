/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LocalShellSessionDependencies } from "./local-shell-session";
import { LocalShellSession } from "./local-shell-session";
import type { Cluster } from "../../../common/cluster/cluster";
import type WebSocket from "ws";
import terminalShellEnvModifyInjectable from "../shell-env-modifier/terminal-shell-env-modify.injectable";
import baseBundeledBinariesDirectoryInjectable from "../../../common/vars/base-bundled-binaries-dir.injectable";
import type { Kubectl } from "../../kubectl/kubectl";

export interface OpenLocalShellSessionArgs {
  websocket: WebSocket;
  cluster: Cluster;
  tabId: string;
  kubectl: Kubectl;
}

export type OpenLocalShellSession = (args: OpenLocalShellSessionArgs) => Promise<void>;

const openLocalShellSessionInjectable = getInjectable({
  id: "open-local-shell-session",
  instantiate: (di): OpenLocalShellSession => {
    const deps: LocalShellSessionDependencies = {
      terminalShellEnvModify: di.inject(terminalShellEnvModifyInjectable),
      baseBundeledBinariesDirectory: di.inject(baseBundeledBinariesDirectoryInjectable),
    };

    return (args) => new LocalShellSession(deps, args).open();
  },
  causesSideEffects: true,
});

export default openLocalShellSessionInjectable;
