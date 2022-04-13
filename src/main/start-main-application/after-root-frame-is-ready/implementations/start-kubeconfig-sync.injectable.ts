/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterRootFrameIsReadyInjectionToken } from "../after-root-frame-is-ready-injection-token";
import directoryForKubeConfigsInjectable from "../../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import kubeconfigSyncManagerInjectable from "../../../catalog-sources/kubeconfig-sync-manager/kubeconfig-sync-manager.injectable";
import ensureDirInjectable from "../../../../common/fs/ensure-dir.injectable";

const startKubeconfigSyncInjectable = getInjectable({
  id: "start-kubeconfig-sync",

  instantiate: (di) => {
    const directoryForKubeConfigs = di.inject(directoryForKubeConfigsInjectable);
    const kubeConfigSyncManager = di.inject(kubeconfigSyncManagerInjectable);
    const ensureDir = di.inject(ensureDirInjectable);

    return {
      run: async () => {
        await ensureDir(directoryForKubeConfigs);

        kubeConfigSyncManager.startSync();
      },
    };
  },

  injectionToken: afterRootFrameIsReadyInjectionToken,
});

export default startKubeconfigSyncInjectable;
