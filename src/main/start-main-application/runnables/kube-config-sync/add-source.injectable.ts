/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import kubeconfigSyncManagerInjectable from "../../../catalog-sources/kubeconfig-sync/manager.injectable";
import catalogEntityRegistryInjectable from "../../../catalog/entity-registry.injectable";
import { afterRootFrameIsReadyInjectionToken } from "../../runnable-tokens/after-root-frame-is-ready-injection-token";

const addKubeconfigSyncAsEntitySourceInjectable = getInjectable({
  id: "add-kubeconfig-sync-as-entity-source",
  instantiate: (di) => {
    const kubeConfigSyncManager = di.inject(kubeconfigSyncManagerInjectable);
    const entityRegistry = di.inject(catalogEntityRegistryInjectable);

    return {
      run: () => {
        entityRegistry.addComputedSource("kubeconfig-sync", kubeConfigSyncManager.source);
      },
    };
  },
  injectionToken: afterRootFrameIsReadyInjectionToken,
});

export default addKubeconfigSyncAsEntitySourceInjectable;
