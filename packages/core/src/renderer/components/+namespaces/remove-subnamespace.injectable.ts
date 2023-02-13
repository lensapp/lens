/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import customResourceDefinitionStoreInjectable from "../+custom-resources/definition.store.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import loggerInjectable from "../../../common/logger.injectable";

const removeSubnamespaceInjectable = getInjectable({
  id: "remove-subnamespace",

  instantiate: (di) => {
    const crdStore = di.inject(customResourceDefinitionStoreInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const logger = di.inject(loggerInjectable);

    /**
     * Removing subnamespace controlled by hierarchical namespace controller by deleting
     * the SubnamespaceAnchor from the parent namespace. Anchor is CRD with the same name
     * https://github.com/kubernetes-sigs/hierarchical-namespaces/blob/master/docs/user-guide/quickstart.md#subnamespaces-deep-dive
     * @param subnamespaceName namespace name
     * @returns 
     */
    return async (subnamespaceName: string) => {
      await crdStore.loadAll();

      const anchorCrd = crdStore.getByGroup("hnc.x-k8s.io", "subnamespaceanchors");
      const store = apiManager.getStore(anchorCrd?.getResourceApiBase());

      await store?.loadAll();

      const anchor = store?.getByName(subnamespaceName);

      if (!anchor) {
        logger.error("[REMOVING-SUBNAMESPACE]: Error removing namespace: can not find subnamespace anchor.");
        
        return;
      }

      store?.remove(anchor);
    };
  },
});

export default removeSubnamespaceInjectable;
