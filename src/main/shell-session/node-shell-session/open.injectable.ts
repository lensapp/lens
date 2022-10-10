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
      createKubeJsonApiForCluster: di.inject(createKubeJsonApiForClusterInjectable),
    };
    const kubectl = createKubectl(params.cluster.version);
    const session = new NodeShellSession(dependencies, { kubectl, ...params });

    return session.open();
  },
  // NOTE: this must be transient to bypass the circular dependency of `createKubeJsonApiForClusterInjectable` on the lens proxy port
  lifecycle: lifecycleEnum.transient,
});

export default openNodeShellSessionInjectable;
