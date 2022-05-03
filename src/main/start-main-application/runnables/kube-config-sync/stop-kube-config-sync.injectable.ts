/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import kubeconfigSyncManagerInjectable from "../../../catalog-sources/kubeconfig-sync-manager/kubeconfig-sync-manager.injectable";
import { beforeQuitOfFrontEndInjectionToken } from "../../runnable-tokens/before-quit-of-front-end-injection-token";

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

  injectionToken: beforeQuitOfFrontEndInjectionToken,
});

export default stopKubeConfigSyncInjectable;
