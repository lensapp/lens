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
import getDirnameOfPathInjectable from "../../../common/path/get-dirname.injectable";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";
import getBasenameOfPathInjectable from "../../../common/path/get-basename.injectable";
import computeShellEnvironmentInjectable from "../../utils/shell-env/compute-shell-environment.injectable";
import spawnPtyInjectable from "../spawn-pty.injectable";
import resolvedShellInjectable from "../../../common/user-store/resolved-shell.injectable";
import appNameInjectable from "../../../common/vars/app-name.injectable";
import buildVersionInjectable from "../../vars/build-version/build-version.injectable";

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
      isWindows: di.inject(isWindowsInjectable),
      logger: di.inject(loggerInjectable),
      userStore: di.inject(userStoreInjectable),
      resolvedShell: di.inject(resolvedShellInjectable),
      appName: di.inject(appNameInjectable),
      buildVersion: di.inject(buildVersionInjectable).get(),
      modifyTerminalShellEnv: di.inject(modifyTerminalShellEnvInjectable),
      getDirnameOfPath: di.inject(getDirnameOfPathInjectable),
      joinPaths: di.inject(joinPathsInjectable),
      getBasenameOfPath: di.inject(getBasenameOfPathInjectable),
      computeShellEnvironment: di.inject(computeShellEnvironmentInjectable),
      spawnPty: di.inject(spawnPtyInjectable),
    };

    return (args) => {
      const kubectl = createKubectl(args.cluster.version);
      const session = new LocalShellSession(dependencies, { kubectl, ...args });

      return session.open();
    };
  },
});

export default openLocalShellSessionInjectable;
