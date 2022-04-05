/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";
import entitySettingsRouteInjectable from "../../../common/front-end-routing/routes/entity-settings/entity-settings-route.injectable";

const entitySettingsRouteParametersInjectable = getInjectable({
  id: "entity-settings-route-parameters",

  instantiate: (di) => {
    const route = di.inject(entitySettingsRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable)(route);

    return {
      entityId: computed(() => pathParameters.get().entityId),
    };
  },
});

export default entitySettingsRouteParametersInjectable;
