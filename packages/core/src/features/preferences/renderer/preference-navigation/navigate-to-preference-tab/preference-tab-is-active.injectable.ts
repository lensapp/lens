/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import routeIsActiveInjectable from "../../../../../renderer/routes/route-is-active.injectable";
import preferencesRouteInjectable from "../../../common/preferences-route.injectable";
import currentPreferenceTabIdInjectable from "../../preference-items/current-preference-tab-id.injectable";

const preferenceTabIsActiveInjectable = getInjectable({
  id: "preference-tab-is-active",

  instantiate: (di, tabId: string) => {
    const route = di.inject(preferencesRouteInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);
    const currentTabId = di.inject(currentPreferenceTabIdInjectable);

    return computed(
      () =>
        routeIsActive.get() && currentTabId.get() === tabId,
    );
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, tabId: string) => tabId,
  }),
});

export default preferenceTabIsActiveInjectable;
