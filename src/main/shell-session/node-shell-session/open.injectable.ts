/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import type WebSocket from "ws";
import createKubectlInjectable from "../../kubectl/create-kubectl.injectable";
import type { NodeShellSessionDependencies } from "./node-shell-session";
import { NodeShellSession } from "./node-shell-session";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import createKubeJsonApiForClusterInjectable from "../../../common/k8s-api/create-kube-json-api-for-cluster.injectable";
import computeShellEnvironmentInjectable from "../../../features/shell-sync/main/compute-shell-environment.injectable";
import spawnPtyInjectable from "../spawn-pty.injectable";
import userShellSettingInjectable from "../../../common/user-store/shell-setting.injectable";
import appNameInjectable from "../../../common/vars/app-name.injectable";
import buildVersionInjectable from "../../vars/build-version/build-version.injectable";
import emitAppEventInjectable from "../../../common/app-event-bus/emit-event.injectable";
import statInjectable from "../../../common/fs/stat.injectable";

export interface NodeShellSessionArgs {
  websocket: WebSocket;
  cluster: Cluster;
  tabId: string;
  nodeName: string;
}

const openNodeShellSessionInjectable = getInjectable({
  id: "open-node-shell-session",
  instantiate: (di, params: NodeShellSessionArgs) => {
    const createKubectl = di.inject(createKubectlInjectable);
    const dependencies: NodeShellSessionDependencies = {
      isMac: di.inject(isMacInjectable),
      isWindows: di.inject(isWindowsInjectable),
      logger: di.inject(loggerInjectable),
      userShellSetting: di.inject(userShellSettingInjectable),
      appName: di.inject(appNameInjectable),
      buildVersion: di.inject(buildVersionInjectable),
      createKubeJsonApiForCluster: di.inject(createKubeJsonApiForClusterInjectable),
      computeShellEnvironment: di.inject(computeShellEnvironmentInjectable),
      spawnPty: di.inject(spawnPtyInjectable),
      emitAppEvent: di.inject(emitAppEventInjectable),
      stat: di.inject(statInjectable),
    };
    const kubectl = createKubectl(params.cluster.version);
    const session = new NodeShellSession(dependencies, { kubectl, ...params });

    return session.open();
  },
  // NOTE: this must be transient to bypass the circular dependency of `createKubeJsonApiForClusterInjectable` on the lens proxy port
  lifecycle: lifecycleEnum.transient,
});

export default openNodeShellSessionInjectable;
