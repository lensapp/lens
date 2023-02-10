/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import customResourceDefinitionStoreInjectable from "../+custom-resources/definition.store.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import showErrorNotificationInjectable from "../notifications/show-error-notification.injectable";
import showSuccessNotificationInjectable from "../notifications/show-success-notification.injectable";

const removeSubnamespaceInjectable = getInjectable({
  id: "remove-subnamespace",

  instantiate: (di) => {
    const crdStore = di.inject(customResourceDefinitionStoreInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const showSuccessNotification = di.inject(showSuccessNotificationInjectable);

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
        showErrorNotification("Error removing namespace: can not find subnamespace anchor.");
        
        return;
      }

      await store?.remove(anchor);

      showSuccessNotification(`Subnamespace ${subnamespaceName} removed`);
    };
  },
});

export default removeSubnamespaceInjectable;
