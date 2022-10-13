/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import type WebSocket from "ws";
import createKubectlInjectable from "../../kubectl/create-kubectl.injectable";
import { NodeShellSession } from "./node-shell-session";
import loggerInjectable from "../../../common/logger.injectable";
import resolvedShellInjectable from "../../../common/user-store/resolved-shell.injectable";
import appNameInjectable from "../../../common/vars/app-name.injectable";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import computeShellEnvironmentInjectable from "../../utils/shell-env/compute-shell-environment.injectable";
import buildVersionInjectable from "../../vars/build-version/build-version.injectable";
import spawnPtyInjectable from "../spawn-pty.injectable";

interface InstantiationParameter {
  websocket: WebSocket;
  cluster: Cluster;
  tabId: string;
  nodeName: string;
}

const nodeShellSessionInjectable = getInjectable({
  id: "node-shell-session",

  instantiate: (di, { cluster, tabId, websocket, nodeName }: InstantiationParameter) => {
    const createKubectl = di.inject(createKubectlInjectable);

    return new NodeShellSession({
      appName: di.inject(appNameInjectable),
      buildVersion: di.inject(buildVersionInjectable),
      computeShellEnvironment: di.inject(computeShellEnvironmentInjectable),
      isMac: di.inject(isMacInjectable),
      isWindows: di.inject(isWindowsInjectable),
      logger: di.inject(loggerInjectable),
      resolvedShell: di.inject(resolvedShellInjectable),
      spawnPty: di.inject(spawnPtyInjectable),
    }, {
      nodeName,
      kubectl: createKubectl(cluster.version),
      websocket,
      cluster,
      tabId,
    });
  },

  lifecycle: lifecycleEnum.transient,
});

export default nodeShellSessionInjectable;
