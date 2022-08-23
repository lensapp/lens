/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import { computed } from "mobx";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { filter, map, sortBy } from "lodash/fp";
import { pipeline } from "@ogre-tools/fp";
import { kubeObjectDetailItemInjectionToken } from "./kube-object-detail-item-injection-token";

const kubeObjectDetailItemsInjectable = getInjectable({
  id: "kube-object-detail-items",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const items = computedInjectMany(kubeObjectDetailItemInjectionToken);

    return computed(() => {
      return pipeline(
        items.get(),
        filter((item) => item.enabled.get()),
        sortBy((item) => item.orderNumber),
        map((item) => item.Component),
      );
    });
  },
});

export default kubeObjectDetailItemsInjectable;
