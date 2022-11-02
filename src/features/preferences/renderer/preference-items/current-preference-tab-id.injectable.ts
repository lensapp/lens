/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import preferencesRouteInjectable from "../../common/preferences-route.injectable";
import routePathParametersInjectable from "../../../../renderer/routes/route-path-parameters.injectable";

const currentPreferenceTabIdInjectable = getInjectable({
  id: "current-preference-tab-id",

  instantiate: (di) => {
    const preferencesRoute = di.inject(preferencesRouteInjectable);

    const routePathParameters = di.inject(
      routePathParametersInjectable,
      preferencesRoute,
    );

    return computed(
      () => routePathParameters.get().preferenceTabId || "app",
    );
  },
});

export default currentPreferenceTabIdInjectable;
