/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../runnable-tokens/phases";
import kubeconfigSyncManagerInjectable from "../../../catalog-sources/kubeconfig-sync/manager.injectable";

const stopKubeConfigSyncInjectable = getInjectable({
  id: "stop-kube-config-sync",

  instantiate: (di) => ({
    run: () => {
      const kubeConfigSyncManager = di.inject(kubeconfigSyncManagerInjectable);

      kubeConfigSyncManager.stopSync();

      return undefined;
    },
  }),

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopKubeConfigSyncInjectable;
