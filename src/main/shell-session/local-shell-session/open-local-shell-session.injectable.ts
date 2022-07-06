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
import kubectlBinariesPathInjectable from "../../../common/user-store/kubectl-binaries-path.injectable";
import downloadKubectlBinariesInjectable from "../../../common/user-store/download-kubectl-binaries.injectable";
import ensureShellProcessInjectable from "../ensure-shell-process.injectable";
import getCachedShellEnvInjectable from "../get-cached-shell-env.injectable";
import getValidCwdInjectable from "../get-valid-cwd.injectable";
import loggerInjectable from "../../../common/logger.injectable";

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
      kubectlBinariesPath: di.inject(kubectlBinariesPathInjectable),
      downloadKubectlBinaries: di.inject(downloadKubectlBinariesInjectable),
      ensureShellProcess: di.inject(ensureShellProcessInjectable),
      getCachedShellEnv: di.inject(getCachedShellEnvInjectable),
      getValidCwd: di.inject(getValidCwdInjectable),
      logger: di.inject(loggerInjectable),
    };

    return (args) => new LocalShellSession(deps, args).open();
  },
  causesSideEffects: true,
});

export default openLocalShellSessionInjectable;
