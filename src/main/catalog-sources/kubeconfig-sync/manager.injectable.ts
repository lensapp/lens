/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import kubeconfigSyncLoggerInjectable from "./logger.injectable";
import { KubeconfigSyncManager } from "./manager";
import watchFileChangesInjectable from "./watch-file-changes.injectable";

const kubeconfigSyncManagerInjectable = getInjectable({
  id: "kubeconfig-sync-manager",

  instantiate: (di) => new KubeconfigSyncManager({
    directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
    logger: di.inject(kubeconfigSyncLoggerInjectable),
    watchFileChanges: di.inject(watchFileChangesInjectable),
  }),
});

export default kubeconfigSyncManagerInjectable;
