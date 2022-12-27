/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import namespaceStoreInjectable from "../+namespaces/store.injectable";
import showErrorNotificationInjectable from "../notifications/show-error-notification.injectable";
import podStoreInjectable from "./store.injectable";

const loadPodsFromAllNamespacesInjectable = getInjectable({
  id: "load-pods-from-all-namespaces",
  instantiate: (di) => {
    const podStore = di.inject(podStoreInjectable);
    const namespaceStore = di.inject(namespaceStoreInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
  
    return () => {
      podStore.loadAll({
        namespaces: [...namespaceStore.getItems().map(ns => ns.getName())],
        onLoadFailure: error =>
          showErrorNotification(`Can not load Pods. ${String(error)}`),
      });
    };
  },
});

export default loadPodsFromAllNamespacesInjectable;
