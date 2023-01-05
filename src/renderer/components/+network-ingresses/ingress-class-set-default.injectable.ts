/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IngressClass } from "../../../common/k8s-api/endpoints/ingress-class.api";
import ingressClassApiInjectable
  from "../../../common/k8s-api/endpoints/ingress-class.api.injectable";
import ingressClassStoreInjectable from "./ingress-class-store.injectable";

export const ingressClassSetDefaultInjectable = getInjectable({
  id: "ingressClassSetDefaultInjectable",

  instantiate(di) {
    return async (currentItem: IngressClass) => {
      const api = di.inject(ingressClassApiInjectable);
      const store = di.inject(ingressClassStoreInjectable);

      const defaultIngressClassesUpdate = store.items
        .filter((item: IngressClass) => item.isDefault && currentItem !== item)
        .map(item => api.setAsDefault({ name: item.getName() }, false));

      await Promise.all(defaultIngressClassesUpdate);
      await api.setAsDefault({ name: currentItem.getName() });
      await store.reloadAll({ force: true });
    };
  },

  lifecycle: lifecycleEnum.singleton,
});
