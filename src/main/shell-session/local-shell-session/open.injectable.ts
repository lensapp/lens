/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LocalShellSessionDependencies } from "./local-shell-session";
import { LocalShellSession } from "./local-shell-session";
import createKubectlInjectable from "../../kubectl/create-kubectl.injectable";
import modifyTerminalShellEnvInjectable from "../shell-env-modifier/modify-terminal-shell-env.injectable";
import directoryForBinariesInjectable from "../../../common/app-paths/directory-for-binaries/directory-for-binaries.injectable";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import userStoreInjectable from "../../../common/user-store/user-store.injectable";
import type WebSocket from "ws";

export interface OpenLocalShellSessionArgs {
  websocket: WebSocket;
  cluster: Cluster;
  tabId: string;
}

export type OpenLocalShellSession = (args: OpenLocalShellSessionArgs) => Promise<void>;

const openLocalShellSessionInjectable = getInjectable({
  id: "open-local-shell-session",

  instantiate: (di): OpenLocalShellSession => {
    const createKubectl = di.inject(createKubectlInjectable);
    const dependencies: LocalShellSessionDependencies = {
      directoryForBinaries: di.inject(directoryForBinariesInjectable),
      isMac: di.inject(isMacInjectable),
      modifyTerminalShellEnv: di.inject(modifyTerminalShellEnvInjectable),
      isWindows: di.inject(isWindowsInjectable),
      logger: di.inject(loggerInjectable),
      userStore: di.inject(userStoreInjectable),
    };

    return (args) => {
      const kubectl = createKubectl(args.cluster.version);
      const session = new LocalShellSession(dependencies, { kubectl, ...args });

      return session.open();
    };
  },
});

export default openLocalShellSessionInjectable;
