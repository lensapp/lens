/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { filter, sortBy } from "lodash/fp";
import { computed } from "mobx";
import { topBarItemOnLeftSideInjectionToken } from "./top-bar-item-injection-token";

const topBarItemsOnLeftSideInjectable = getInjectable({
  id: "top-bar-items-on-left-side",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);

    const items = computedInjectMany(topBarItemOnLeftSideInjectionToken);

    return computed(() =>
      pipeline(
        items.get(),
        filter((item) => item.isShown.get()),
        sortBy(item => item.orderNumber),
      ),
    );
  },
});

export default topBarItemsOnLeftSideInjectable;
