/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import routeIsActiveInjectable from "../../../../routes/route-is-active.injectable";
import preferencesRouteInjectable from "../../../../../features/preferences/common/preferences-route.injectable";
import routePathParametersInjectable from "../../../../routes/route-path-parameters.injectable";

const preferenceTabIsActiveInjectable = getInjectable({
  id: "preference-tab-is-active",

  instantiate: (di, tabId: string) => {
    const route = di.inject(preferencesRouteInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);
    const pathParameters = di.inject(routePathParametersInjectable, route);

    return computed(
      () =>
        routeIsActive.get() && pathParameters.get().preferenceTabId === tabId,
    );
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, tabId: string) => tabId,
  }),
});

export default preferenceTabIsActiveInjectable;
