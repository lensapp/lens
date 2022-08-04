/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../runnable-tokens/before-quit-of-back-end-injection-token";
import kubeconfigSyncManagerInjectable from "../../../catalog-sources/kubeconfig-sync/manager.injectable";

const stopKubeConfigSyncInjectable = getInjectable({
  id: "stop-kube-config-sync",

  instantiate: (di) => {
    const kubeConfigSyncManager = di.inject(kubeconfigSyncManagerInjectable);

    return {
      run: () => {
        kubeConfigSyncManager.stopSync();
      },
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopKubeConfigSyncInjectable;
