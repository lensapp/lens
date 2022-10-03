/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsLoadedInjectionToken } from "../../runnable-tokens/after-application-is-loaded-injection-token";
import directoryForKubeConfigsInjectable from "../../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import ensureDirInjectable from "../../../../common/fs/ensure-dir.injectable";
import kubeconfigSyncManagerInjectable from "../../../catalog-sources/kubeconfig-sync/manager.injectable";
import addKubeconfigSyncAsEntitySourceInjectable from "./add-source.injectable";

const startKubeConfigSyncInjectable = getInjectable({
  id: "start-kubeconfig-sync",

  instantiate: (di) => {
    const directoryForKubeConfigs = di.inject(directoryForKubeConfigsInjectable);
    const kubeConfigSyncManager = di.inject(kubeconfigSyncManagerInjectable);
    const ensureDir = di.inject(ensureDirInjectable);

    return {
      id: "start-kubeconfig-sync",
      run: async () => {
        await ensureDir(directoryForKubeConfigs);

        kubeConfigSyncManager.startSync();
      },
      runAfter: di.inject(addKubeconfigSyncAsEntitySourceInjectable),
    };
  },

  causesSideEffects: true,

  injectionToken: afterApplicationIsLoadedInjectionToken,
});

export default startKubeConfigSyncInjectable;
