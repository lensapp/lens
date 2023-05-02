/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import removePathInjectable from "../../common/fs/remove.injectable";
import execFileInjectable from "../../common/fs/exec-file.injectable";
import writeFileInjectable from "../../common/fs/write-file.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import { ResourceApplier } from "./resource-applier";
import createKubectlInjectable from "../kubectl/create-kubectl.injectable";
import kubeconfigManagerInjectable from "../kubeconfig-manager/kubeconfig-manager.injectable";
import type { Cluster } from "../../common/cluster/cluster";

const resourceApplierInjectable = getInjectable({
  id: "resource-applier",
  instantiate: (di, cluster) => new ResourceApplier(
    {
      deleteFile: di.inject(removePathInjectable),
      emitAppEvent: di.inject(emitAppEventInjectable),
      execFile: di.inject(execFileInjectable),
      joinPaths: di.inject(joinPathsInjectable),
      logger: di.inject(loggerInjectionToken),
      writeFile: di.inject(writeFileInjectable),
      createKubectl: di.inject(createKubectlInjectable),
      proxyKubeconfigManager: di.inject(kubeconfigManagerInjectable, cluster),
    },
    cluster,
  ),
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default resourceApplierInjectable;
